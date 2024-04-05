import { Item } from "@/types/item.ts";

export function searchFilter(values: Array<Item>, search: string | undefined): Array<Item> {
  if (!search) return []
  const searchData = search.split(' ').filter(s => s).map(s => s.toLowerCase());
  return values.filter(value => {
    const valueData = value.label.split(' ').filter(v => v).map(v => v.toLowerCase());
    for (const s of searchData) {
      if (valueData.find(v => v.includes(s))) continue;
      return false;
    }
    return true;
  })
    .sort((a, b) => {
      const aShow = a.label.toLowerCase();
      const bShow = b.label.toLowerCase();
      if (aShow.indexOf(search.toLowerCase()) > bShow.indexOf(search.toLowerCase())) {
        return 1;
      } else if (aShow.indexOf(search.toLowerCase()) < bShow.indexOf(search.toLowerCase())) {
        return -1;
      }
      return a.label.localeCompare(b.label)
    })
}
