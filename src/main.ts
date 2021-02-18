import { NestFactory } from "@nestjs/core"
import { DesktopBgAdapter } from "./adapters/desktopbg/adapter"
import { EmagAdapter } from "./adapters/emag/adapter"
import { GplayAdapter } from "./adapters/gplay/adapter"
import { JarAdapter } from "./adapters/jar/jarAdapter"
import { JmtAdapter } from "./adapters/jmt/adapter"
import { AppModule } from "./app.module"
import { Crawler } from "./crawler/crawler"

const crawler = new Crawler(
  [
    new EmagAdapter(),
    new JarAdapter(),
    new GplayAdapter(),
    new DesktopBgAdapter(),
    new JmtAdapter()
  ],
  ["2060", "2070", "2080", "3060", "3070", "3080", "3090", "6800", "6900"],
)

const timeTick = async () => {
  const items = await crawler.getItems()

  const date = new Date().toTimeString()
  if (items.length === 0) {
    console.info(`${date} No cards found`)
  } else {
    console.error(`${date} There are ${items.length} cards found`)

    items.forEach(i => {
      console.log(`Shop: ${i.shop}`)
      console.log(`Name: ${i.name}`)
      console.log(`Price: ${i.price}`)
      console.log(`IsInStock: ${i.isInStock}`)
      console.log(`Link: ${i.itemUrl}`)
      console.log(" ")
      console.log("---")
    })
  }

  setTimeout(() => {
    timeTick
  }, 60*1000);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
timeTick();
