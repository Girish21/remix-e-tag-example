import { Link, useSearchParams } from 'react-router-dom'
import type {
  HeadersFunction,
  LoaderFunction,
  LinksFunction,
  MetaFunction,
} from 'remix'
import { Form, block, json, useRouteData } from 'remix'
import type { Recipe, RecipeLink } from '~/types'
import { getEnv } from '~/util/env.server'
import Etag from '~/util/etag.server'
import { extractId } from '~/util/misc.server'

type ErrorResponse = { error: boolean }
type RecipesResponse = {
  recipes: Recipe[]
  nextPage: string
  hasNextPage: boolean
}
type Data = ErrorResponse | RecipesResponse

const isError = (data: Data): data is ErrorResponse => 'error' in data

export let meta: MetaFunction = ({ location }) => {
  const queryParams = new URLSearchParams(location.search.slice(1))
  const query = queryParams.get('search')

  return {
    title: query ? `Searching for ${query}` : 'Recipes',
    description: 'Awesome Recipe search',
  }
}

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    Etag: `W\\${loaderHeaders.get('Etag')}`,
  }
}

export let links: LinksFunction = ({ data }) => {
  const typedData = data as Data
  return isError(typedData)
    ? []
    : typedData.recipes.slice(0, 6).map(({ recipe }) =>
        block({
          rel: 'preload',
          href: recipe.image,
          as: 'image',
        })
      )
}

export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('search') ?? "''"
  const nextPageFromBrowser = url.searchParams.get('n') ?? undefined
  const apiURL = getEnv('API_ENDPOINT')
  const app_id = getEnv('APP_ID') ?? ''
  const app_key = getEnv('APP_KEY') ?? ''
  const browserEtag = request.headers.get('If-None-Match')

  const queryParams = new URLSearchParams([
    ['type', 'public'],
    ['q', q],
    ['app_id', app_id],
    ['app_key', app_key],
    ['diet', 'balanced'],
    ['field', 'label'],
    ['field', 'image'],
    ['field', 'url'],
    ['field', 'dietLabels'],
    ['field', 'healthLabels'],
    ['field', 'cautions'],
    ['field', 'calories'],
    ['field', 'mealType'],
    ['field', 'cuisineType'],
    ['field', 'dishType'],
  ])

  if (nextPageFromBrowser) {
    queryParams.append('_cont', nextPageFromBrowser)
  }

  try {
    const fetchRequest = await fetch(`${apiURL}?${queryParams.toString()}`)
    const fetchData = (await fetchRequest.json()) as {
      from: number
      to: number
      count: number
      hits: (Recipe & RecipeLink)[]
      _links: { next: { href: string } }
    }

    const nextPage = new URL(fetchData._links.next.href).searchParams.get(
      '_cont'
    )
    const transformedData = fetchData.hits.map((recipe) => extractId(recipe))
    const responseData = {
      recipes: transformedData,
      nextPage,
      hasNextPage: fetchData.to < fetchData.count,
    }
    const dataEtag = Etag(JSON.stringify(responseData))

    if (browserEtag === dataEtag) {
      return new Response('', { status: 304 })
    }
    return json(responseData, {
      headers: { Etag: dataEtag },
    })
  } catch (e) {
    console.error(e)
  }

  return { error: true }
}

export default function Index() {
  const data = useRouteData<Data>()
  const [query] = useSearchParams()

  return (
    <main className='w-[min(100%,80vw)] mx-auto space-y-10'>
      <h1 className='mt-20 text-5xl text-center'>Recipies</h1>
      <Form
        method='get'
        className='w-full grid place-content-center'
        autoComplete='off'
      >
        <fieldset>
          <label className='sr-only' htmlFor='search'>
            Search
          </label>
          <input
            key={query.get('search')}
            name='search'
            id='search'
            defaultValue={query.get('search') ?? ''}
            placeholder='Search...'
            className='py-2 px-4 rounded bg-gray-600 focus:outline-none focus:ring focus:ring-gray-400 placeholder-gray-400'
          />
        </fieldset>
      </Form>
      <section>
        {isError(data) ? (
          <article className='w-[min(100%,30vw)] mx-auto rounded-lg ring-4 ring-red-500 px-6 py-4 bg-red-400 bg-opacity-95 text-xl font-bold text-center'>
            Sorry! Error ⚠️
          </article>
        ) : (
          <>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(365px,1fr))] gap-x-6 gap-y-4'>
              {data.recipes.map(({ recipe }) => (
                <Link to={`recipe/${recipe.id}`} key={recipe.id}>
                  <article className='h-full border border-gray-600 rounded-lg px-2 py-4 shadow-md'>
                    <img
                      src={recipe.image}
                      alt={`${recipe.mealType[0]} - ${recipe.label}`}
                      className='w-full h-full min-h-full'
                    />
                  </article>
                </Link>
              ))}
            </div>
            <div className='mt-6 mb-8 flex justify-center items-center gap-6'>
              {!!query.get('n') ? (
                <Link
                  to={`/?${new URLSearchParams([
                    ['search', query.get('search') ?? ''],
                  ]).toString()}`}
                  className='px-2 py-1 inline-block rounded-md bg-gray-800 ring ring-gray-400 text-lg'
                >
                  Back to top
                </Link>
              ) : null}
              {data.hasNextPage ? (
                <Link
                  to={`/?${new URLSearchParams([
                    ['search', query.get('search') ?? ''],
                    ['n', data.nextPage],
                  ]).toString()}`}
                  className='px-2 py-1 inline-block rounded-md bg-gray-800 ring ring-gray-400 text-lg'
                >
                  Next
                </Link>
              ) : null}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
