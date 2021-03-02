import { Controller, Get, Render } from '@nestjs/common';
import { DesktopBgAdapter } from './adapters/desktopbg/adapter';
import { EmagAdapter } from './adapters/emag/adapter';
import { GplayAdapter } from './adapters/gplay/adapter';
import { JarAdapter } from './adapters/jar/jarAdapter';
import { PlasicoAdapter } from './adapters/plasico/adapter';
import { AppService } from './app.service';
import { Crawler } from './crawler/crawler';
import { JmtAdapter } from './adapters/jmt/adapter';
import { ArdesAdapter } from './adapters/ardes/adapter';
import { PCBuildBgAdapter } from './adapters/pcbuild-bg/adapter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async getHello() {
    const crawler = new Crawler(
      [
        new EmagAdapter(),
        new JarAdapter(),
        new GplayAdapter(),
        new DesktopBgAdapter(),
        new JmtAdapter(),
        new PlasicoAdapter(),
        new ArdesAdapter(),
        new PCBuildBgAdapter(),
      ],
      [ "1060", "1070", "1080",
        "2060", "2070", "2080",
        "3060", "3070", "3080", "3090",
        "6800", "6900",
        "5600", "5700",
        "1650", "1660" ],
    )

    const items = await crawler.getItems()
    return { items };
  }
}
