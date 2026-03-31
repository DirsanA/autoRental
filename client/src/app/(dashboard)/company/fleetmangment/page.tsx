import { MOCK_VEHICLES } from "../types";
import { CompanyFleetManagementEntry } from "@/components/company/vehicles/company-fleet-management-entry";

export default function CompanyFleetManagementRoute() {
  return <CompanyFleetManagementEntry initialVehicles={MOCK_VEHICLES} />;
}
