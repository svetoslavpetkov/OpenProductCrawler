/* eslint-disable prettier/prettier */
import axios from 'axios';
import { IItem, IShopAdapter, PagedResult } from '../../abstraction/model';

interface IDataResponseDepartment {
  id: string;
  name: string;
  sef_name: string;
}

interface IEmagUrl {
  path: string;
  desktop_base: string;
  mobile_base: string;
}

interface IDataResponseCategory {
  id: number;
  name: string;
  sef_name: string;
  display_type: string;
  department: IDataResponseDepartment;
  subdepartment: IDataResponseDepartment;
  trail: string;
  listing_id: number;
  english_name: string;
}

interface IEmagItem {
  id: number;
  category: IDataResponseCategory;
  name: string;
  part_number_key: string;
  image: {
    original: string;
    resized_images: Array<{ size: string; url: string }>;
  };
  multiple_offers_count: number;
  used_offers_count: number;
  offers_count: number;
  multiple_min_price: number;
  used_min_price: number;
  offer: {
    id: number;
    type: number;
    price: {
      current: number;
      initial: number;
      is_min: boolean;
      is_max: boolean;
      legal: number;
      prefix: string;
      suffix: string;
      is_visible: boolean;
      currency: {
        id: number;
        name: {
          default: string;
          display: string;
        };
        net: number;
      };
    };
    flags: {
      is_main: boolean;
      is_used: boolean;
      is_sales: boolean;
      is_active: boolean;
      has_discount: boolean;
      may_be_ordered: boolean;
      has_ecredit: boolean;
      has_bundles: boolean;
      has_gifts: boolean;
      has_bundle_first: boolean;
      is_self_source: boolean;
      has_warranty: boolean;
      has_badges: boolean;
      is_visible: boolean;
      has_services: boolean;
      has_buyback: boolean;
      has_two_hour_delivery: boolean;
      has_same_day_delivery: boolean;
      has_three_hour_delivery: boolean;
      has_free_delivery: boolean;
      has_delivery_estimate: boolean;
      has_pickup: boolean;
      has_unified_badges: boolean;
      has_loyalty_points: boolean;
      has_banners: boolean;
      is_fulfilment_by_emag: boolean;
      has_free_return: boolean;
      is_open_package: boolean;
      is_bf: boolean;
      has_campaign_badge: boolean;
      is_custom_discount: boolean;
      has_unfair_price: boolean;
      is_genius_eligible: boolean;
    };
    available_delivery_methods: Array<string>;
    unit: {
      id: number;
      name: string;
    };
    vendor: {
      id: number;
      name: {
        default: string;
        display: string;
      };
      sef_name: string;
      url: IEmagUrl;
      is_fde_eligible: boolean;
    };
    availability: {
      id: number;
      text: string;
      code: string;
      days_estimation: number;
    };
    part_number: string;
    display_type: string;
    buying_options: {
      type: string;
      default: number;
      min: number;
      max: number;
      step: Array<number>;
      unit: { id: number };
      storage_type: { id: number };
      has_delivery: boolean;
      has_pickup: boolean;
      has_easybox: boolean;
      price: number;
    };
  };
  feedback: any;
  url: IEmagUrl;
  quick_uri: string;
  sef_name: string;
  scm_super_category: { id: number; name: string };
  flags: {
    has_multiple: boolean;
    has_used: boolean;
    has_description: boolean;
    has_characteristics: boolean;
    has_image_gallery: boolean;
    has_video_gallery: boolean;
    has_image: boolean;
    has_image360: boolean;
    has_offer: boolean;
    has_family: boolean;
    is_family: boolean;
    has_profiling_widgets: boolean;
    has_datalayer_info: boolean;
    has_recommendations: boolean;
    may_be_compared: boolean;
    has_pac: boolean,
    has_pac_bundle: boolean,
    is_infringement: boolean,
    show_active_users: boolean,
    allow_favorites: boolean,
    allow_feedback: boolean
  }
  availability_key: number
  resource: { type: string, id:string }
  used_offer_id_having_min_price: number
  added_to_favorites_count: number
}

interface IEmagResponse {
  code: number
  data: {
    short_title: string
    title: string
    category: IDataResponseCategory
    conditions: {
      filters: {
        department: Array<string>
        subdepartment: Array<string>
        category: Array<number>
        shop_id: number
        page_type: string
      }      
    }
    items: Array<IEmagItem>
    pagination: {
      position_item_start: number,
      position_item_end: number,
      items_per_page: number,
      items_count: number
    }
  }
  metadata: any
  notifications: any
}

export class EmagAdapter implements IShopAdapter {

  constructor() {}

  getName(): string {
    return "Emag"
  }

  getUrl(pageSize = 100, offset =0) {
    return `https://www.emag.bg/search-by-url?source_id=7&templates[]=full&is_eab344=false&sort[price]=desc&listing_display_id=2&page[limit]=${pageSize}&page[offset]=${offset}&fields[items][image_gallery][fashion][limit]=2&fields[items][image][resized_images]=1&fields[items][resized_images]=200x200,350x350&fields[items][flags]=1&fields[items][offer][buying_options]=1&fields[items][offer][flags]=1&fields[items][offer][bundles]=1&fields[items][offer][gifts]=1&fields[items][characteristics]=listing&fields[quick_filters]=1&search_id=&search_fraze=&search_key=&url=/video-karti/sort-pricedesc/c`
  }

  async getItems() : Promise<Array<IItem>> {
    const result: Array<IItem> = [];
    let offset = 0;
    let pageSize = 100;
    let totalCount = 0;
    do {
      const pagedResult = await this.getPagedResult(pageSize, offset);
      result.push(...pagedResult.items)
      offset = offset + pageSize;
      totalCount = pagedResult.totalCount;
    } while (offset < totalCount)

    return result;
  }

  async getPagedResult(pageSize = 100, offset =0): Promise<PagedResult<IItem>> {
    const url = this.getUrl(100, 0);

    const raw = await  axios.get<IEmagResponse>(url, {
      headers: {
        "Accept": "application/json, text/javascript",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
      }
    })

    const items = raw.data.data.items.map(i=> ({
      identifier: i.id.toString(),
      name: i.name,
      description: i.name,
      category: i.category.name,
      isInStock: i.offer.flags.may_be_ordered,
      price: i.offer.price.current,
      shop: "e-mag",
      itemUrl: `${i.url.desktop_base}${i.url.path}`,
      imageUrl: i.image.original
    }))

    const totalCount = raw.data.data.pagination.items_count;

    return { items, totalCount};
  }
}