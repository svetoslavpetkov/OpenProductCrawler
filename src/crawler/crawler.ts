import { IItem, IShopAdapter } from "src/abstraction/model";

export class Crawler {
  constructor(private readonly adapters: Array<IShopAdapter>,
    private readonly searchTerms: Array<string>) {}


  async getItems(): Promise<Array<IItem>> {
    const result: Array<IItem> =[];
    for(const adapter of this.adapters) {
      const beginDate = new Date();

      console.info(` ${beginDate.toTimeString()} Started ${adapter.getName()}`)
      try {
        const items = await adapter.getItems();
        console.info(`Items found: ${items.length}`)
        result.push(...items);
      } catch(e) {
        console.error("Error getting adapter data", e)
      }
      const endDate = new Date()
      const durationInSec = (endDate.getTime() - beginDate.getTime())/ 1000
      console.info(`${endDate.toTimeString()} Completed ${adapter.getName()} for ${ durationInSec.toFixed(2) } seconds`)
    }

    //filter
    return result.filter( i => {
      return this.searchTerms
        .some(searchTerm => i.name.includes(searchTerm));
    })
  }
}


