export interface ILogger {
  info(msg: string, context?: any): void
  warning(msg: string, context?: any): void
  error(msg: string, context?: any): void
}

export interface IItem {
  shop: string
  identifier: string
  name: string
  category: string
  description: string
  price: number
  pictures?: Array<string>
  itemUrl?: string
  isInStock: boolean
}

const sanitize = (input: string | undefined): string | undefined => {
  return !input ? undefined : input.replace("\n", "").replace("\t", "").trim()
}
export class ItemUtil {
  static create(input: IItem): IItem {
    return {
      category: sanitize(input.category),
      description: sanitize(input.description),
      identifier: sanitize(input.identifier),
      isInStock: input.isInStock,
      name: sanitize(input.name),
      price: input.price,
      shop: sanitize(input.shop),
      itemUrl: sanitize(input.itemUrl),
      pictures: !input.pictures ? [] : input.pictures.map(sanitize)
    }
  }
}

export interface PagedResult<T> {
  items: Array<T>
  totalCount: number
}

export interface IShopAdapter {
  getItems(): Promise<Array<IItem>>

  getName(): string
}
