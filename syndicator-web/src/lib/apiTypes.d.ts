/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/auth/register": {
    /** Register */
    post: operations["api_api_register"];
  };
  "/auth/login": {
    /** Login */
    post: operations["api_api_login"];
  };
  "/auth/change_password": {
    /** Change Password */
    post: operations["api_api_change_password"];
  };
  "/auth/logout": {
    /** Logout */
    post: operations["api_api_logout"];
  };
  "/auth/user": {
    /** Get User */
    get: operations["api_api_get_user"];
  };
  "/articles": {
    /** Articles */
    get: operations["api_api_articles"];
  };
  "/favorites": {
    /** Favorites */
    get: operations["api_api_favorites"];
  };
  "/subscriptions/": {
    /** Subscritions */
    get: operations["api_api_subscritions"];
    /** Add Subscription */
    post: operations["api_api_add_subscription"];
  };
  "/subscriptions/{key}/{slug}": {
    /** Delete Subscription */
    delete: operations["api_api_delete_subscription"];
  };
  "/clicks/{feed_key}/{feed_slug}/{item_key}/{item_slug}": {
    /** Click */
    post: operations["api_api_click"];
    /** Unclick */
    delete: operations["api_api_unclick"];
  };
  "/favorites/{feed_key}/{feed_slug}/{item_key}/{item_slug}": {
    /** Favorite */
    post: operations["api_api_favorite"];
    /** Unfavorite */
    delete: operations["api_api_unfavorite"];
  };
  "/csrf": {
    /** Csrf */
    post: operations["api_api_csrf"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** UserOut */
    UserOut: {
      /** Email */
      email: string;
    };
    /** UserIn */
    UserIn: {
      /** Email */
      email: string;
      /** Password */
      password: string;
    };
    /** ChangePasswordIn */
    ChangePasswordIn: {
      /** Old Password */
      old_password: string;
      /** New Password */
      new_password: string;
    };
    /** OK */
    OK: {
      /**
       * Success
       * @default true
       */
      success?: boolean;
    };
    /** FeedSchema */
    FeedSchema: {
      /** Title */
      title: string;
      /** Description */
      description: string | null;
      /** Image */
      image: string | null;
      /** Language */
      language: string | null;
      /** Last Build Date */
      last_build_date: string | null;
      /** Pub Date */
      pub_date: string | null;
      /** Generator */
      generator: string | null;
      /** Url */
      url: string | null;
      /** Feed Url */
      feed_url: string;
      /** Path */
      path: string;
    };
    /** ItemSchema */
    ItemSchema: {
      /** Title */
      title: string;
      /** Description */
      description: string | null;
      /** Link */
      link: string;
      /** Image */
      image: string | null;
      /**
       * Pub Date
       * Format: date-time
       */
      pub_date: string;
      feed: components["schemas"]["FeedSchema"];
      /** Path */
      path: string;
      /** Clicked */
      clicked: boolean | null;
      /** Favorited */
      favorited: string | null;
    };
    /** FeedIn */
    FeedIn: {
      /** Url */
      url: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  /** Register */
  api_api_register: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["UserIn"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserOut"];
        };
      };
    };
  };
  /** Login */
  api_api_login: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["UserIn"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserOut"];
        };
      };
    };
  };
  /** Change Password */
  api_api_change_password: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChangePasswordIn"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserOut"];
        };
      };
    };
  };
  /** Logout */
  api_api_logout: {
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
  /** Get User */
  api_api_get_user: {
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["UserOut"];
        };
      };
    };
  };
  /** Articles */
  api_api_articles: {
    parameters: {
      query?: {
        before?: string | null;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["ItemSchema"][];
        };
      };
    };
  };
  /** Favorites */
  api_api_favorites: {
    parameters: {
      query?: {
        before?: string | null;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["ItemSchema"][];
        };
      };
    };
  };
  /** Subscritions */
  api_api_subscritions: {
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["FeedSchema"][];
        };
      };
    };
  };
  /** Add Subscription */
  api_api_add_subscription: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["FeedIn"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["FeedSchema"];
        };
      };
    };
  };
  /** Delete Subscription */
  api_api_delete_subscription: {
    parameters: {
      path: {
        key: string;
        slug: string;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
  /** Click */
  api_api_click: {
    parameters: {
      path: {
        feed_key: string;
        feed_slug: string;
        item_key: string;
        item_slug: string;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
  /** Unclick */
  api_api_unclick: {
    parameters: {
      path: {
        feed_key: string;
        feed_slug: string;
        item_key: string;
        item_slug: string;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
  /** Favorite */
  api_api_favorite: {
    parameters: {
      path: {
        feed_key: string;
        feed_slug: string;
        item_key: string;
        item_slug: string;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
  /** Unfavorite */
  api_api_unfavorite: {
    parameters: {
      path: {
        feed_key: string;
        feed_slug: string;
        item_key: string;
        item_slug: string;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
  /** Csrf */
  api_api_csrf: {
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["OK"];
        };
      };
    };
  };
}
