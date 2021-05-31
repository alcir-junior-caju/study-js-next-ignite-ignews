import { render, screen } from  '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getSession } from 'next-auth/client';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

const post = {
    slug: 'fake-title',
    title: 'Fake Title',
    content: '<p>Fake excerpt</p>',
    updatedAt: '04-01-2021'
};

describe('Post Page', () => {
    it('renders correctly', () => {
        render(
            <Post post={post} />
        );

        expect(screen.getByText('Fake Title')).toBeInTheDocument();
        expect(screen.getByText('Fake excerpt')).toBeInTheDocument();
    });

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = mocked(getSession);
        getSessionMocked.mockResolvedValueOnce(null);

        const response = await getServerSideProps({
            params: {
                slug: 'fake-title'
            }
        } as any);

        expect(response).toEqual(expect.objectContaining({
            redirect: expect.objectContaining({
                destination: '/'
            })
        }));
    });

    it('loads initial data', async () => {
        const getSessionMocked = mocked(getSession);
        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any);

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

        const response = await getServerSideProps({
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
