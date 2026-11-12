import { SpacesGridSkeleton, SpacesHeader } from "../_components/spaces-grid";

export default function SpacesLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SpacesHeader />
      <SpacesGridSkeleton />
    </div>
  );
}
