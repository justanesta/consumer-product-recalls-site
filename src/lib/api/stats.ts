import type { components, paths } from './schema';
import { client, unwrap } from './client';

export type StatsOverview = components['schemas']['StatsOverview'];
export type PeriodCount = components['schemas']['PeriodCount'];
export type MonthlyTrendPoint = components['schemas']['MonthlyTrendPoint'];
export type ClassificationCount = components['schemas']['ClassificationCount'];
export type StatusCount = components['schemas']['StatusCount'];
export type FirmLeaderRow = components['schemas']['FirmLeaderRow'];
export type GeographyCount = components['schemas']['GeographyCount'];
export type CountryCount = components['schemas']['CountryCount'];
export type UnitsRow = components['schemas']['UnitsRow'];
export type StatsSource = components['schemas']['StatsSource'];
export type Grain = components['schemas']['Grain'];
export type GeographyBasis = components['schemas']['GeographyBasis'];

/** `GET /stats/overview` — single-object headline KPIs (landing). */
export function getStatsOverview(signal?: AbortSignal) {
  return unwrap(client.GET('/stats/overview', { signal }));
}

/** `GET /stats/recalls-by-period?grain=month|week|year` — period counts (+ ALL rollup). */
export function getRecallsByPeriod(
  query?: paths['/stats/recalls-by-period']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/recalls-by-period', { params: { query }, signal }));
}

/** `GET /stats/monthly-trend` — per-source trend with rolling averages + YoY (no ALL). */
export function getMonthlyTrend(
  query?: paths['/stats/monthly-trend']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/monthly-trend', { params: { query }, signal }));
}

/** `GET /stats/by-classification` — counts by source-native classification (+ ALL). */
export function getByClassification(
  query?: paths['/stats/by-classification']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/by-classification', { params: { query }, signal }));
}

/** `GET /stats/status` — active / inactive / unknown counts per source (+ ALL). */
export function getStatusBreakdown(
  query?: paths['/stats/status']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/status', { params: { query }, signal }));
}

/** `GET /stats/firm-leaderboard?limit=` — most-recalled firms. */
export function getFirmLeaderboard(
  query?: paths['/stats/firm-leaderboard']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/firm-leaderboard', { params: { query }, signal }));
}

/**
 * `GET /stats/by-geography?basis=distribution|firm_registration` — per-state counts.
 * The two bases are DIFFERENT questions; render them as two separate captioned charts.
 */
export function getByGeography(
  query: NonNullable<paths['/stats/by-geography']['get']['parameters']['query']>,
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/by-geography', { params: { query }, signal }));
}

/** `GET /stats/by-country` — per-distribution-country counts (FDA/USDA + ALL). */
export function getByCountry(
  query?: paths['/stats/by-country']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/by-country', { params: { query }, signal }));
}

/** `GET /stats/units` — units recalled per source × category × month (not cross-source comparable). */
export function getUnits(
  query?: paths['/stats/units']['get']['parameters']['query'],
  signal?: AbortSignal,
) {
  return unwrap(client.GET('/stats/units', { params: { query }, signal }));
}
