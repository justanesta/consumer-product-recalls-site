import type { components } from './schema';
import { client, unwrap } from './client';

export type FirmProfile = components['schemas']['FirmProfile'];
export type UsdaEstablishment = components['schemas']['UsdaEstablishment'];
export type UscgManufacturer = components['schemas']['UscgManufacturer'];
export type FdaAttributes = components['schemas']['FdaAttributes'];

/** `GET /firms/{firm_id}` — one canonical firm. `firm_id` is a 32-hex md5 (422 on bad shape). */
export function getFirm(firmId: string, signal?: AbortSignal) {
  return unwrap(client.GET('/firms/{firm_id}', { params: { path: { firm_id: firmId } }, signal }));
}
