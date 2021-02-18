import axios from "axios"
import parse from "node-html-parser"
import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"

interface PagedResult {
  items: Array<IItem>
  hasNextPage: boolean
}

export class DesktopBgAdapter implements IShopAdapter {
  getName(): string {
    return "Desktop.bg"
  }

  async getItems(): Promise<IItem[]> {
    const result: IItem[] = []
    let page = 1
    let hasNextPage = false
    const pageSize = 100

    do {
      const pageRes = await this.getPagedItems(page, pageSize)
      page += 1
      hasNextPage = pageRes.hasNextPage

      result.push(...pageRes.items)
    } while (hasNextPage && page <= 10)

    return result
  }

  async getPagedItems(page: number, pageSize: number): Promise<PagedResult> {
    const result: PagedResult = {
      hasNextPage: false,
      items: []
    }

    const url = this.getUrl(page, pageSize)
    console.log(`Fetching page ${page} with rul: '${url}'`)

    const raw = await axios.get(url)
    const html = "" + raw.data
    const root = parse(html)

    const productContainer = root.querySelector("#products-container")

    result.hasNextPage = !!productContainer.querySelector("ul.products li.next-page")

    //next-page
    result.items = productContainer
      .querySelectorAll("ul.products li")
      .filter(x => x.id && x.id.startsWith("product"))
      .map(productDom => {
        const identifier = productDom.id

        const name = productDom.querySelector("article a h2").innerText
        const itemUrl = productDom.querySelector("article a").getAttribute("href")
        const imageUrl = "https://desktop.bg" + productDom.querySelector("article a img").getAttribute("src")
        const price: number = parseInt(productDom.querySelector("article div.price-container span.price").innerText)
        return ItemUtil.create({
          category: "Видео карти",
          description: name,
          name,
          identifier,
          isInStock: true,
          shop: this.getName(),
          itemUrl,
          imageUrl,
          price
        })
      })

    return result
  }

  getUrl(page: number, pageSize: number) {
    return `https://desktop.bg/desktop_video_cards-all?utf8=%E2%9C%93&price_btw_all=all&search%5Bprice_gte%5D=&search%5Bprice_lte%5D=&brand_id_in_all=all&brand_name_id_in_all=all&chip_id_in_all=all&bus_type_id_in_all=all&ram_id_in_all=all&ram_type_id_in_all=all&size_type_id_in_all=all&cooler_type_id_in_all=all&warranty_size_btw_all=all&per_page=${pageSize}&search%5Bs%5D=price_desc`
     + (page > 1 ? `&page=${page}` : "")
  }

}