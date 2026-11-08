import { ERRANDS } from "#/world/core/errands"
import { getErrandRequests } from "#/world/core/get-errand-requests"

const residents = [...new Set(ERRANDS.map((errand) => errand.from))]

/** 日ごとの依頼を、抽選順位ではなく住民の定義順で返す。 */
export function errandsOn(day: string) {
  const requests = getErrandRequests(day)

  return residents.flatMap((resident) => {
    const errand = requests.get(resident)
    return errand ? [errand] : []
  })
}
