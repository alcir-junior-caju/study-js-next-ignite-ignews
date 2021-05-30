import { render, screen } from  '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import Posts, { getStaticProps } from '../../pages/posts';

jest.mock('../../services/prismic');

const posts = [{
    slug: 'fake-title',
    title: 'Fake Title',
    excerpt: 'Fake excerpt',
    updatedAt: '04-01-2021'
}];

describe('Posts Page', () => {
    it('renders correctly', () => {
        render(
            <Posts posts={posts} />
        );

        expect(screen.getByText('Fake Title')).toBeInTheDocument();
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient);
        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [{
                    uid: 'fake-title',
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
                }]
            })
        } as any);

        const response = await getStaticProps({});

        expect(response).toEqual(expect.objectContaining({
            props: {
                posts: [{
                    slug: 'fake-title',
                    title: 'Fake Title',
                    excerpt: 'Fake excerpt',
                    updatedAt: 'April 01, 2021'
                }]
            }
        }));
    });
});
