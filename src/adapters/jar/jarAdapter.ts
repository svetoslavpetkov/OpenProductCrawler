import { IItem, IShopAdapter, ItemUtil } from "../../abstraction/model"
import { parse } from "node-html-parser"
import axios from "axios"

export class JarAdapter implements IShopAdapter {
  getName(): string {
    return "JarComputers"
  }

  async getItems(): Promise<IItem[]> {
    const result: IItem[] = []
    const response = await axios.get("https://www.jarcomputers.com/Video-karti_cat_75.html?ref=c_74")

    const html = "" + response.data

    const root = parse(html);

    const productsList = root.querySelector("#product_list");

    productsList.querySelectorAll("li.hProduct").forEach(product => {
      const linkDom = product.querySelector("div.s1 a");
      const itemUrl = linkDom.getAttribute("href")
      const imageUrl = linkDom.querySelector("img").getAttribute("src")


      const descriptionRoot = product.querySelector("div.s2");
      const name = descriptionRoot.querySelector(".short_title a").innerText
      const description = descriptionRoot.querySelector(".long_title a").innerText
      const category = "Видео карти"
      const identifier = descriptionRoot.querySelector(".pprop li.list_sku").innerText.replace("<b>Код</b>", "")

      const priceText = product.querySelector("div.s3 div.cart_table_list td.price div").innerText;
      const indexOfDot = priceText.indexOf(".")

      const price: number = parseInt(priceText.substring(0, indexOfDot))
      
      result.push(ItemUtil.create({
        category,
        description,
        identifier,
        isInStock: true,
        name,
        price,
        shop:"JarComputers",
        itemUrl,
        imageUrl
      }))    
    })

    return result;
  }
}
