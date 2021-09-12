import {
  HeadersFunction,
  LoaderFunction,
  LinksFunction,
  MetaFunction,
  block,
} from 'remix'
import { json, useRouteData } from 'remix'
import { getEnv } from '~/util/env.server'
import Etag from '~/util/etag.server'

import styles from '../styles/recipe.$slug.css'

type Data = {
  label: string
  image: string
  yield: string
  dietLabels: string[]
  healthLabels: string[]
  ingredientLines: string[]
  calories: number
  totalTime: number
  cuisineType: string[]
  mealType: string[]
  dishType: string[]
}

export const links: LinksFunction = ({ data }) => {
  return [
    { rel: 'stylesheet', href: styles },
    block({ rel: 'preload', href: (data as Data).image, as: 'image' }),
  ]
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: (data as Data).label,
    description: `Recipe for ${(data as Data).label}`,
  }
}

export const header: HeadersFunction = ({ loaderHeaders }) => {
  return { Etag: `W\\${loaderHeaders.get('Etag')}` }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  console.log(params.slug)
  const apiURL = getEnv('API_ENDPOINT')
  const app_id = getEnv('APP_ID') ?? ''
  const app_key = getEnv('APP_KEY') ?? ''
  const browserEtag = request.headers.get('If-None-Match')

  const queryParams = new URLSearchParams([
    ['type', 'public'],
    ['app_id', app_id],
    ['app_key', app_key],
    ['field', 'label'],
    ['field', 'image'],
    ['field', 'yield'],
    ['field', 'dietLabels'],
    ['field', 'healthLabels'],
    ['field', 'ingredientLines'],
    ['field', 'calories'],
    ['field', 'totalTime'],
    ['field', 'cuisineType'],
    ['field', 'mealType'],
    ['field', 'dishType'],
  ])

  try {
    const response = await fetch(
      `${apiURL}/${params.slug}?${queryParams.toString()}`
    )
    const data = await response.json()
    const recipe = data.recipe
    const dataEtag = Etag(JSON.stringify(recipe))

    if (dataEtag === browserEtag) {
      return new Response('', { status: 304 })
    }

    return json(recipe, { headers: { Etag: dataEtag } })
  } catch (e) {
    console.error(e)
  }

  return {}
}

const Recipe = () => {
  const data = useRouteData<Data>()

  return (
    <main className='w-full md:w-[min(100%,80vw)] my-20 mx-auto'>
      <article className='grid grid-cols-12 grid-rows-[auto] gap-y-6 gap-x-3'>
        <figure className='col-start-2 col-end-12 lg:col-start-3 lg:col-end-11 aspect-w-4 aspect-h-3 lg:aspect-w-16 lg:aspect-h-9'>
          <img
            className='w-full h-full col-start-2 col-end-10 rounded-lg object-cover'
            src={data.image}
            alt={`${data.label}`}
          />
        </figure>
        <header className='row-start-2 row-end-3 col-start-2 col-end-12 lg:col-end-7'>
          <h1 className='text-[length:var(--title-xl)]'>{data.label}</h1>
          <ul className='flex items-center capitalize space-x-3'>
            <li>{data.cuisineType?.[0]}</li>
            <li className='w-2 h-2 rounded-full bg-white' />
            <li>{data.mealType}</li>
            <li className='w-2 h-2 rounded-full bg-white' />
            <li>{data.dishType}</li>
          </ul>
        </header>
        <aside className='py-6 px-8 col-start-2 col-end-12 lg:row-span-2 lg:col-start-7 lg:col-end-12 rounded-lg bg-gray-800 shadow-md'>
          <ul className='h-full grid items-center gap-y-4 md:grid-cols-2 md:grid-rows-2 md:gap-2 md:gap-y-6 with-mark'>
            <li>
              Total time: <span className='font-bold'>{data.totalTime}</span>
            </li>
            <li>
              Serves: <span className='font-bold'>{data.yield}</span>
            </li>
            <li>
              Calories:{' '}
              <span className='font-bold'>{data.calories.toFixed(0)}</span>
            </li>
            <li>
              Diet: <span className='font-bold'>{data.dietLabels?.[0]}</span>
            </li>
          </ul>
        </aside>
        <section className='col-start-2 col-end-12 space-y-6'>
          <h2 className='text-[length:var(--title-lg)] underline'>
            Ingredients
          </h2>
          <ol className='flex flex-col list-decimal gap-3 ml-4'>
            {data.ingredientLines.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ol>
        </section>
      </article>
    </main>
  )
}

export default Recipe
