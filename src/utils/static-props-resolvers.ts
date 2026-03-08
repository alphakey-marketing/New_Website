import { ConfigModel } from '.stackbit/models/Config';
import { ThemeStyleModel } from '.stackbit/models/ThemeStyle';
import {
    Config,
    ContentObject,
    ContentObjectType,
    GlobalProps,
    PageComponentProps,
    PostFeedLayout,
    PostLayout,
    ProjectFeedLayout,
    ProjectLayout,
    RecentPostsSection,
    RecentProjectsSection,
    ThemeStyle
} from '@/types';
import { deepMapObject } from './data-utils';

export function resolveStaticProps(urlPath: string, allData: ContentObject[]): PageComponentProps {
    const originalPage = allData.find((obj) => obj.__metadata.urlPath === urlPath);
    const globalProps: GlobalProps = {
        site: allData.find((obj) => obj.__metadata.modelName === ConfigModel.name) as Config,
        theme: allData.find((obj) => obj.__metadata.modelName === ThemeStyleModel.name) as ThemeStyle
    };

    function enrichContent(value: any) {
        const type = value?.__metadata?.modelName;
        if (type && PropsResolvers[type]) {
            const resolver = PropsResolvers[type];
            return resolver(value, allData, urlPath);
        } else {
            return value;
        }
    }

    const enrichedPage = deepMapObject(originalPage, enrichContent) as ContentObject;
    return {
        ...enrichedPage,
        global: globalProps
    };
}

type ResolverFunction = (props: ContentObject, allData: ContentObject[], pageUrlPath?: string) => ContentObject;

const PropsResolvers: Partial<Record<ContentObjectType, ResolverFunction>> = {
    PostFeedLayout: (props, allData) => {
        const allPosts = getAllPostsSorted(allData);
        const pageUrlPath = props.__metadata?.urlPath || '';
        const isZhPage = pageUrlPath.startsWith('/zh/');
        
        const filteredPosts = allPosts.filter((post) => {
            const postUrlPath = post.__metadata?.urlPath || '';
            if (isZhPage) {
                return postUrlPath.startsWith('/zh/blog/');
            } else {
                return postUrlPath.startsWith('/blog/') && !postUrlPath.startsWith('/zh/');
            }
        });
        
        return {
            ...(props as PostFeedLayout),
            items: filteredPosts
        };
    },
    RecentPostsSection: (props, allData, pageUrlPath = '') => {
        const isZhPage = pageUrlPath === '/zh' || pageUrlPath.startsWith('/zh/');
        const allPosts = getAllPostsSorted(allData);
        
        const filteredPosts = allPosts.filter((post) => {
            const postUrlPath = post.__metadata?.urlPath || '';
            if (isZhPage) {
                return postUrlPath.startsWith('/zh/blog/');
            } else {
                return postUrlPath.startsWith('/blog/') && !postUrlPath.startsWith('/zh/');
            }
        });
        
        const recentPosts = filteredPosts.slice(0, (props as RecentPostsSection).recentCount || 3);
        return {
            ...props,
            posts: recentPosts
        };
    },
    ProjectLayout: (props, allData) => {
        const allProjects = getAllProjectsSorted(allData);
        const currentProjectId = props.__metadata?.id;
        const currentProjectIndex = allProjects.findIndex((project) => project.__metadata?.id === currentProjectId);
        const nextProject = currentProjectIndex > 0 ? allProjects[currentProjectIndex - 1] : null;
        const prevProject = currentProjectIndex < allProjects.length - 1 ? allProjects[currentProjectIndex + 1] : null;
        return {
            ...props,
            prevProject,
            nextProject
        };
    },
    ProjectFeedLayout: (props, allData) => {
        const allProjects = getAllProjectsSorted(allData);
        const pageUrlPath = props.__metadata?.urlPath || '';
        const isZhPage = pageUrlPath.startsWith('/zh/');
        
        const filteredProjects = allProjects.filter((project) => {
            const projectUrlPath = project.__metadata?.urlPath || '';
            if (isZhPage) {
                return projectUrlPath.startsWith('/zh/projects/');
            } else {
                return projectUrlPath.startsWith('/projects/') && !projectUrlPath.startsWith('/zh/');
            }
        });
        
        return {
            ...(props as ProjectFeedLayout),
            items: filteredProjects
        };
    },
    RecentProjectsSection: (props, allData, pageUrlPath = '') => {
        const isZhPage = pageUrlPath === '/zh' || pageUrlPath.startsWith('/zh/');
        const allProjects = getAllProjectsSorted(allData);
        
        const filteredProjects = allProjects.filter((project) => {
            const projectUrlPath = project.__metadata?.urlPath || '';
            if (isZhPage) {
                return projectUrlPath.startsWith('/zh/projects/');
            } else {
                return projectUrlPath.startsWith('/projects/') && !projectUrlPath.startsWith('/zh/');
            }
        });
        
        const recentProjects = filteredProjects.slice(
            0,
            (props as RecentProjectsSection).recentCount || 3
        );
        return {
            ...props,
            projects: recentProjects
        };
    }
};

function getAllPostsSorted(objects: ContentObject[]) {
    const all = objects.filter((object) => object.__metadata?.modelName === 'PostLayout') as PostLayout[];
    const sorted = all.sort((postA, postB) => new Date(postB.date).getTime() - new Date(postA.date).getTime());
    return sorted;
}

function getAllProjectsSorted(objects: ContentObject[]) {
    const all = objects.filter((object) => object.__metadata?.modelName === 'ProjectLayout') as ProjectLayout[];
    const sorted = all.sort(
        (projectA, projectB) => new Date(projectB.date).getTime() - new Date(projectA.date).getTime()
    );
    return sorted;
}
