type TFollowParams = {
    userId: string;
}

type TFollowersResponse = {
    id: string;
    fullName: string | null;
    username: string | null;
    avatar: string | null;
    bio: string | null;
    isFollowing: boolean;
}

type TGetFollowersQuery = {
    page?: string;
    limit?: string;
}

export type { TFollowParams, TFollowersResponse, TGetFollowersQuery };
