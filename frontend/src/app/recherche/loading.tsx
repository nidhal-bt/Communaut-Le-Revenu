import { SearchField, SearchHeader } from "./_components/search-shell";

export default function SearchLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SearchHeader />
      <SearchField query="" />
    </div>
  );
}
