const getEnv = (key: string, obj = process.env) => {
  if (!(key in obj)) {
    throw new Error(`${key} is required and not present in the environemnt`)
  }
  return obj[key]
}

export { getEnv }
