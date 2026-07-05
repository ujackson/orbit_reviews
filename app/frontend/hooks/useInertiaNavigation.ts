import { router, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';

export const useNavigate = () => {
  return (target: string | number, options?: Parameters<typeof router.visit>[1]) => {
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

export const useWorkspacePath = () => {
  const page = usePage<SharedProps>();
  const workspaceId = page.props.currentWorkspace?.id ?? 'default';

  return (target = '') => {
    const suffix = target === '' || target === '/' ? '' : `/${target.replace(/^\/+/, '')}`;
    return `/w/${workspaceId}${suffix}`;
  };
};

export const workspaceRelativePath = (pathname: string) => {
  const stripped = pathname.replace(/^\/w\/[^/]+/, '');
  return stripped === '' ? '/' : stripped;
};
