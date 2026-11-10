import { SearchField, SearchHeader } from "./_components/search-shell";

/** Le même en-tête et le même champ que `page.tsx` : la bascule ne se voit pas. */
export default function SearchLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SearchHeader />
      <SearchField query="" />
    </div>
  );
}
