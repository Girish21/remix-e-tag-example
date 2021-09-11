type Recipe = {
  recipe: {
    id: string | null
    label: string
    image: string
    url: string
    dietLabels: string[]
    healthLabels: string[]
    cautions: string[]
    calories: number
    cuisineType: string[]
    mealType: string[]
    dishType: string[]
  }
}

type RecipeLink = {
  _links: { self: { href: string } }
}

export { Recipe, RecipeLink }
