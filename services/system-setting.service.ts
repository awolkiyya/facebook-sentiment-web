import {
  api,
} from "@/lib/api/api";

import type {
  SingleResponse,
} from "@/types/api";

import type {
  SystemSetting,
  UpdateSystemSettingRequest,
} from "@/types/system-setting";

/**
 * systemSettingService
 *
 * SYSTEM SETTINGS API
 *
 * Resource:
 *
 *     Singleton system settings
 *
 * Authentication:
 *
 *     Laravel Sanctum Stateful SPA Authentication
 *
 * Authorization:
 *
 *     system.settings.view
 *     system.settings.update
 *
 * Endpoints:
 *
 *     GET   /v1/system-settings
 *     PUT   /v1/system-settings
 *     PATCH /v1/system-settings
 */
export const systemSettingService = {
  /*
  |--------------------------------------------------------------------------
  | GET SYSTEM SETTINGS
  |--------------------------------------------------------------------------
  */

  get: async (): Promise<SystemSetting> => {
    const response =
      await api.get<
        SingleResponse<SystemSetting>
      >(
        "/v1/system-settings"
      );

    if (!response.data.data) {
      throw new Error(
        "System settings data was not returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE SYSTEM SETTINGS
  |--------------------------------------------------------------------------
  */

  update: async (
    data: UpdateSystemSettingRequest
  ): Promise<SystemSetting> => {
    const response =
      await api.patch<
        SingleResponse<SystemSetting>
      >(
        "/v1/system-settings",
        data
      );

    if (!response.data.data) {
      throw new Error(
        "System settings update succeeded but no settings data was returned."
      );
    }

    return response.data.data;
  },
};
