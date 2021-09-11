import { pathToRegexp } from 'path-to-regexp'
import type { Recipe, RecipeLink } from '~/types'

type RecipeWithoutId = Omit<Recipe, 'id'> & RecipeLink

const extractId = (recipe: RecipeWithoutId): Recipe => {
  const url = new URL(recipe._links.self.href)
  const pathRegex = pathToRegexp(`/api/recipes/v2/:id`)
  const matches = pathRegex.exec(url.pathname)

  if (!matches) {
    return {
      recipe: {
        ...recipe.recipe,
        id: null,
      },
    }
  }

  const [, id] = matches

  return {
    recipe: {
      ...recipe.recipe,
      id: id,
    },
  }
}

export { extractId }
