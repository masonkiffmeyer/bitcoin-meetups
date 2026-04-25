export type Meetup = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  stateAbbr: string;
  lat: number;
  lng: number;
  cadence: string;
  venue: string;
  description: string;
  attendance: string;
  beginnerFriendly: boolean;
  website?: string;
  twitter?: string;
  nostr?: string;
  telegram?: string;
  meetupUrl?: string;
  verified: boolean; // true = Mason has personally confirmed
  needsVerification: boolean; // true = Claude added from search, Mason should verify before public launch
  tags?: string[];
};

export type State = {
  name: string;
  abbr: string;
  slug: string;
};
