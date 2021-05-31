import { render, screen } from  '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getSession, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router');

const post = {
    slug: 'fake-title',
    title: 'Fake Title',
    content: '<p>Fake excerpt</p>',
    updatedAt: '04-01-2021'
};

describe('Post Preview Page', () => {
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession);
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(
            <Post post={post} />
        );

        expect(screen.getByText('Fake Title')).toBeInTheDocument();
        expect(screen.getByText('Fake excerpt')).toBeInTheDocument();
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
    });

    it('redirects user to full post when user is subscibed', async () => {
        const useSessionMocked = mocked(useSession);
        useSessionMocked.mockReturnValueOnce([
            { activeSubscription: 'fake-active-subscription'},
            false
        ] as any);

        const useRouterMocked = mocked(useRouter);
        const pushMocked = jest.fn();
        useRouterMocked.mockReturnValueOnce({
            push: pushMocked
        } as any);

        render(<Post post={post} />);

        expect(pushMocked).toHaveBeenCalledWith('/posts/fake-title');
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient);
        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [{
                        type: 'heading',
                        text: 'Fake Title'
                    }],
                    content: [{
                        type: 'paragraph',
                        text: 'Fake excerpt'
                    }]
                },
                last_publication_date: '04-01-2021'
            })
        } as any);

        const response = await getStaticProps({
            params: {
                slug: 'fake-title'
            }
        } as any);

        expect(response).toEqual(expect.objectContaining({
            props: {
                post: {
                    slug: 'fake-title',
                    title: 'Fake Title',
                    content: '<p>Fake excerpt</p>',
                    updatedAt: 'April 01, 2021'
                }
            }
        }));
    });
});
