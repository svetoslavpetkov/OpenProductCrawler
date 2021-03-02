import axios from "axios"
import parse from "node-html-parser"
import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"

interface PagedResult {
  items: Array<IItem>
  hasNextPage: boolean
}

export class PCBuildBgAdapter implements IShopAdapter {
  getName(): string {
    return "pcbuild.bg"
  }

  async getItems(): Promise<IItem[]> {
    const result: IItem[] = []
    let page = 1
    let hasNextPage = false

    do {
      const pageRes = await this.getPagedItems(page)
      page += 1
      hasNextPage = pageRes.hasNextPage

      result.push(...pageRes.items)
    } while (hasNextPage && page <= 10)

    return result
  }

  async getPagedItems(page: number): Promise<PagedResult> {
    const result: PagedResult = {
      hasNextPage: false,
      items: []
    }

    const url = this.getUrl(page)
    console.log(`Fetching page ${page} with rul: '${url}'`)

    const raw = await axios.get(url)
    const html = "" + raw.data
    const root = parse(html)


    const pagingRoot = root.querySelector(".paginator");

    if(pagingRoot) {
      const allPages = pagingRoot
        .querySelectorAll("li a")
        .map(i => parseInt(i.innerText))
        .filter(x => !isNaN(x))
    
      result.hasNextPage = allPages.some(x => x > page)
    }


  
    const allProductDoms = root
      .querySelectorAll("div.products-list article")
    //next-page
    result.items = allProductDoms    
      .map(productDom => {
        const identifier = productDom.querySelector("a.buy-button").innerText;

        const name = productDom.querySelector("h1.product-title a").innerText;
        const itemUrl = "https://pcbuild.bg" + productDom.querySelector("a.img-container").getAttribute("href")
        
        const imageUrl = productDom.querySelector("a.img-container img").getAttribute("src")
        let rawPrice = productDom.querySelector("div.price-line div.new-price span")
          .innerText
          .replace("лв", "")
          .trim()

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

  getUrl(page: number) {
    const pageSuffix =  page > 1 ? `/page=${page}` : ""
    return `https://pcbuild.bg/shop/video-karti${pageSuffix}`
  }

}