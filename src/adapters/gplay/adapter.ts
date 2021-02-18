import axios from "axios"
import parse from "node-html-parser"
import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"


interface PagedResult {
  items: Array<IItem>
  hasNextPage: boolean
}

export class GplayAdapter implements IShopAdapter {

  getName(): string {
    return "Gplay"
  }

  async getItems(): Promise<IItem[]> {

    const result: IItem[] = []
    let page  = 1;
    let hasNextPage = false

    do {
      const pageRes = await this.getPagedItems(page);
      page+=1;
      hasNextPage = pageRes.hasNextPage;

      result.push(...pageRes.items)

    } while(hasNextPage)

    return result;
  }


  async getPagedItems(page: number): Promise<PagedResult> {

    const url = encodeURI(this.getUrL(page))
    console.log(`Fetching page ${page} with rul: '${url}'`)
    const result: PagedResult = {
      items: [],
      hasNextPage: false
    }

    const raw = await axios.get(url)

    const html = "" + raw.data

    const root = parse(html);

    const catalogContainer = root.querySelector("div.catalog-container")

    const navigationDom = catalogContainer.querySelector("ul.pagination");

    if(navigationDom) {
      const allPages: Array<number> = root
        .querySelectorAll("ul.pagination li.page-item a.page-link")
        .map(a => parseInt(a.innerText))
        .filter(n => !isNaN(n));
      result.hasNextPage = allPages.some( p => p > page);
    }

    result.items = catalogContainer.querySelectorAll("div.grid-item div.product-item")
      .map(productDom => {
        const name = productDom.querySelector("a.product-name").innerText;
        const itemUrl = productDom.querySelector("a.product-name").getAttribute("href")
        const identifier = itemUrl.substring(itemUrl.lastIndexOf("/") + 1)
        const imageUrl = productDom.querySelector("a.product-image img").getAttribute("src")
        //normalPrice.querySelector("price").getAttribute("price")
        const price: number = parseInt(productDom.querySelector("div.product-controls div.price div.normal-price price").getAttribute("price"))
        return ItemUtil.create({
          category: "Видео карти",
          description: name,
          name,
          identifier,
          isInStock: true,
          shop: "Gplay",
          itemUrl,
          pictures: [imageUrl],
          price
        })
      })

    return result;
  }

  getUrL(page: number): string {
    return "https://gplay.bg/видео-карти?flag[]=available&perPage=60&sort=price_desc" + (page > 1 ? `&page=${page}` : "")
  }

}