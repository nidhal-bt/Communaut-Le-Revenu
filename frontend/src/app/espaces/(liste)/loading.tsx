import { SpacesGridSkeleton, SpacesHeader } from "../_components/spaces-grid";

/** Même en-tête et même grille que `page.tsx` : la bascule ne se voit pas. */
export default function SpacesLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SpacesHeader />
      <SpacesGridSkeleton />
    </div>
  );
}
