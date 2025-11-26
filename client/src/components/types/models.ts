export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profilePicture: string;
  signedUpAt: string; // ISO date
  quiver?: Quiver[];
  savedPosts?: SavedPost[];
  boards?: Board[];
  sessions?: Session[];
  posts?: Post[];
  comments?: Comment[];
  likes?: Like[];
  following?: UserFollowing[];
  followers?: UserFollowing[];
}

export interface Board {
  id: number;
  brand: string;
  size: string;
  volume: number;
  name: string;
  ownerId: number;
  owner?: User;
  quiver?: Quiver[];
  sessions?: Session[];
}

export interface Quiver {
  id: number;
  userId: number;
  boardId: number;
  user?: User;
  board?: Board;
}

export interface ForecastReport {
  spotName: string;
  region: string;
  sessionStart: string;
  size: string;
  description: string;
  waveEnergy: string;
  rating: {
    value: number;
    description: string;
  };
  swells: Swell[];
  wind?: {
    speed: string;
    direction: string;
    gust?: string;
  };
  tide?: {
    height: string;
    type: string;
  };
}

export interface ForecastFromAPI {
  id?: number;
  spotName: string;
  region?: string;
  surflineSpotId?: string;
  description?: string;
  size: string;
  waveEnergy?: string;
  date: string | Date;
  tideHeight?: string;
  tideType?: string;
  windDirection?: string;
  windSpeed?: string;
  windGust?: string;
  ratingValue?: number;
  ratingDescription?: string;
  swells?: Swell[];
  sessions?: Session[];
}

export interface Swell {
  id: number;
  forecastId: number;
  name?: string | null;
  height?: string | null;
  period?: string | null;
  power?: string | null;
  direction?: string | null;
}

export interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  rating: "ZERO" | "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  description?: string | null;
  sessionMatchForecast?: string | null;
  image?: string | null; // URL
  shared: boolean;
  userId: number;
  forecastId?: number | null;
  boardId?: number | null;
  postId?: number | null;
  user?: User;
  forecast?: ForecastFromAPI;
  board?: Board;
  post?: Post;
}

export interface SavedPost {
  id: number;
  userId: number;
  postId: number;
  user?: User;
  post?: Post;
}

export interface Post {
  id: number;
  posted: string;
  creatorId: number;
  sessionId?: number | null;
  creator?: User;
  session?: Session;
  likes?: Like[];
  comments?: Comment[];
  savedBy?: SavedPost[];
}

export interface Like {
  id: number;
  postId: number;
  userId: number;
  post?: Post;
  user?: User;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  posted: string;
  post?: Post;
  author?: User;
}

export interface UserFollowing {
  id: number;
  userId: number;
  followingUserId: number;
  user?: User;
  following?: User;
}
