import MarketplaceClient from "./MarketplaceClient";
import { STATIC_DEALERS, STATIC_MARKETPLACE_CARS } from "@/data/marketplace";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <MarketplaceClient cars={STATIC_MARKETPLACE_CARS} dealers={STATIC_DEALERS} />
    </div>
  );
}
