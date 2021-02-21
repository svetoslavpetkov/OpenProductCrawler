import axios from "axios"
import parse from "node-html-parser"
import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"

interface PagedResult {
  items: Array<IItem>
  hasNextPage: boolean
}

export class ArdesAdapter implements IShopAdapter {
  getName(): string {
    return "Ardes"
  }

  async getItems(): Promise<IItem[]> {
    const result: IItem[] = []
    let page = 1
    let hasNextPage = false
    const pageSize = 12

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

    const raw = await axios.post(url, null, {
      headers: {
        "x-requested-with" : "XMLHttpRequest"
      }
    })
    const html = "" + raw.data
    const root = parse(html)

    const allPages = root
      .querySelectorAll("ul.pagination li.number a")
      .map(i => parseInt(i.innerText))
      .filter(x => !isNaN(x))
    
    result.hasNextPage = allPages.some(x => x > page)
  
    const allProductDoms = root
      .querySelectorAll("div.products-grid div.product")
    //next-page
    result.items = allProductDoms    
      .map(productDom => {
        const identifier = productDom.getAttribute("data-sku")

        const name = productDom.querySelector("div.product-head div.image img").getAttribute("alt")
          .replace(" на супер цени", "")
          .replace("Видео карта ", "")
        const itemUrl = "https://ardes.bg" + productDom.querySelector("div.product-head a").getAttribute("href")
        
        const imageUrl = productDom.querySelector("div.product-head div.image img").getAttribute("data-original")
        let rawPrice = productDom.querySelector("div.prices div.price div.price-num").innerText.replace("лв","")
        
        if(rawPrice.endsWith(".")) {
          rawPrice = rawPrice.substring(0, rawPrice.length - 1)
        }

        rawPrice = rawPrice.trim();

        const price: number = parseInt(rawPrice)
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
    const pageSuffix =  page > 1 ? "/page/2" : ""
    return `https://ardes.bg/komponenti/video-karti${pageSuffix}?sort=price&direction=desc`
  }

}