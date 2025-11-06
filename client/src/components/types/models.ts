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

export interface Forecast {
  id: number;
  spotName: string;
  region?: string | null;
  surflineSpotId?: string | null;
  description?: string | null;
  size?: string | null;
  waveEnergy?: string | null;
  date: string; // ISO date
  tideHeight?: string | null;
  tideType?: string | null;
  windDirection?: string | null;
  windSpeed?: string | null;
  windGust?: string | null;
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
  startTime?: string | null;
  description?: string | null;
  sessionMatchForecast?: string | null;
  image?: string | null; // base64 or URL
  shared: boolean;
  userId: number;
  forecastId?: number | null;
  boardId?: number | null;
  user?: User;
  forecast?: Forecast;
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
