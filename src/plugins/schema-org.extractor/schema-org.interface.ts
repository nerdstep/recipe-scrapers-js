import type {
  Role,
  Person as SchemaPerson,
  Recipe as SchemaRecipe,
  Thing as SchemaThing,
} from 'schema-dts'

export type Thing = Extract<SchemaThing, { '@type': string }>

export type Person = Extract<SchemaPerson, { '@type': 'Person' }>

export type Recipe = Extract<SchemaRecipe, { '@type': 'Recipe' }>

// Non-readonly Graph interface for schema.org
export interface Graph {
  '@context': 'https://schema.org'
  '@graph': Thing[]
}

export type SchemaOrgData = Graph | Thing

export type SchemaValue<T, TProperty extends string> =
  | T
  | Role<T, TProperty>
  | readonly (T | Role<T, TProperty>)[]
