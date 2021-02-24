import axios from "axios"
import parse from "node-html-parser"
import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"

interface PagedResult {
  items: Array<IItem>
  hasNextPage: boolean
}

export class PlasicoAdapter implements IShopAdapter {
  getName(): string {
    return "Plasico"
  }

  async getItems(): Promise<IItem[]> {
    const result: IItem[] = []
    let page = 1
    let hasNextPage = false
    const pageSize = 48

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

    const pagingDomRoot =  root
      .querySelector("#list-footer div.pagination div.pages")

    if(pagingDomRoot) {
      const allPages = pagingDomRoot
        .childNodes
        .map(i => parseInt(i.innerText))
        .filter(x => !isNaN(x))
      
      result.hasNextPage = allPages.some(x => x > page)
    }
  
    const allProductDoms = root
      .querySelectorAll("#list-results article")
    //next-page
    result.items = allProductDoms    
      .map(productDom => {
        const identifier = productDom.getAttribute("data-id")

        const name = productDom.querySelector("a.ttl").innerText
        const itemUrl = "https://plasico.bg/" + productDom.querySelector("a.ttl").getAttribute("href")
        
        const imageUrl = productDom.querySelector("a.cimg img").getAttribute("data-original")
        let rawPrice = productDom.querySelector("span.price").innerText.replace("лв","")
        
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
    return `https://plasico.bg/komponenti/video-karti?caller=per_page&filter=1&page=${page}&per_page=${pageSize}`
  }

}