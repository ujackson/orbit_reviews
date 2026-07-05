import { router, usePage } from '@inertiajs/react';
import type { VisitOptions } from '@inertiajs/core';

export const useNavigate = () => {
  return (target: string | number, options?: VisitOptions) => {
    if (typeof target === 'number') {
      window.history.go(target);
      return;
    }

    router.visit(target, options);
  };
};

export const useLocation = () => {
  const page = usePage();
  const [pathname, search = ''] = page.url.split('?');

  return {
    pathname,
    search: search ? `?${search}` : '',
  };
};
