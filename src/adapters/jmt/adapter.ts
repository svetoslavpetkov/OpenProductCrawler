import axios from "axios"
import parse from "node-html-parser"
import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"

interface PagedResult {
  items: Array<IItem>
  hasNextPage: boolean
}

export class JmtAdapter implements IShopAdapter {
  getName(): string {
    return "Jmt"
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

    const allPages = root
      .querySelectorAll("#article-footer #footer-pagintion div.Zebra_Pagination ul li a")
      .map(i => parseInt(i.innerText))
      .filter(x => !isNaN(x))
    
    result.hasNextPage = allPages.some(x => x > page)
  
    const allProductDoms = root
      .querySelectorAll("#productstable-content li.productslist-product")
    //next-page
    result.items = allProductDoms    
      .map(productDom => {
        const identifier = productDom.querySelector(".productslist-product-inner").getAttribute("data-pid")

        const name = productDom.querySelector("div.product-title").innerText
        const itemUrl = productDom.querySelector("div.productslist-product-inner a").getAttribute("href")
        const imageUrl = productDom.getAttribute("data-ei-src")
        let rawPrice = productDom.querySelector("div.productslist-product-inner div.current-price div.coolprice").innerText.replace("лв","")
        
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

  getUrl(page: number) {
    return `https://www.jmt.bg/video-karti.html?order=2`
     + (page > 1 ? `&page=${page}` : "")
  }

}