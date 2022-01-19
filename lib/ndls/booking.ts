import fetch from "isomorphic-fetch";
import { add, Interval, parseISO } from "date-fns";
import { fill } from "lodash";

const NDLS_BASE_URL = "https://booking.ndls.ie";
const NDLS_API_PATH = "/api";
const NDLS_COOKIE_SESSION_NAME = "PHPSESSID";

export type NDLSSession = string;
export type NDLSCentreSlot = Interval;
export type NDLSCentre = {
  id: number;
  location: string;
  county: string;
};

async function createNDLSSession(): Promise<NDLSSession> {
  const res = await request("/new-booking-by-driver-number");

  const cookies = res.headers
    .get("Set-Cookie")
    ?.split(";")
    ?.map((cookie) => {
      return cookie.split("=").map((t) => t.trim());
    });

  if (!cookies) {
    throw new Error(`Unable to create NDLS session, no cookie returned`);
  }

  const sessionCookie = cookies.find(
    (cookie) => cookie[0] === NDLS_COOKIE_SESSION_NAME
  );

  if (!sessionCookie) {
    throw new Error(`Unable to create NDLS session`);
  }

  return sessionCookie[1];
}

type LoginDetails = {
  driverNumber: string;
  dob: string;
  mobile: {
    prefix: string;
    postfix: string;
  };
  email: string;
  preferredContact: "email";
};

export async function login(session: NDLSSession, details: LoginDetails) {
  if (!details.dob.match(/\d{2}\/\d{2}\/\d{4}/)) {
    throw new Error(`Driver DOB must be in the form of "DD/MM/YYYY"`);
  }

  if (details.preferredContact !== "email") {
    throw new Error(`Preferred contact where not email is not yet supported`);
  }

  return await apiRequest(session, "/new-booking/by-driver-number", {
    dr_drivernumber: details.driverNumber,
    dr_dob: details.dob,
    mobilePrefix: details.mobile.postfix,
    mobile: details.mobile.postfix,
    dr_email: details.email,
    dr_preferredcontact: "E",
    tandc: true,
  });
}

export async function createAuthenticatedNDLSSession(
  details: LoginDetails
): Promise<NDLSSession> {
  const session = await createNDLSSession();

  await login(session, details);

  return session;
}

type NDLSAvailabilitySlotsResponse = {
  slots: {
    [key: string]: {
      date: string;
      times: {
        st_start: string;
        count: number;
      }[];
    };
  };
};

export async function getSlotsForCenter(
  session: NDLSSession,
  centreId: number
): Promise<NDLSCentreSlot[]> {
  const response = await apiRequest<NDLSAvailabilitySlotsResponse>(
    session,
    `/availabilities/slots/${centreId}`
  );

  return Object.values(response.slots)
    .flatMap((data) => data.times)
    .flatMap(({ st_start, count }) => {
      const startDate = parseISO(st_start);
      const interval = {
        start: startDate,
        end: add(startDate, {
          minutes: 15,
        }),
      };

      return fill(Array(count), interval);
    });
}

type NDLSCentresResponse = {
  availabilities: {
    ce_id: number;
    ce_location: string;
    ce_county: string;
  }[];
};

export async function getCenters(session: NDLSSession): Promise<NDLSCentre[]> {
  const centres = await apiRequest<NDLSCentresResponse>(
    session,
    "/availabilities/centres"
  );

  return centres.availabilities.map((centre) => ({
    id: centre.ce_id,
    county: centre.ce_county,
    location: centre.ce_location,
  }));
}

async function request(
  path: string,
  options?: Parameters<typeof fetch>[1]
): Promise<Response> {
  const res = await fetch(`${NDLS_BASE_URL}${path}`, options);

  if (!res.ok) {
    throw new Error(`Unable to fetch ${NDLS_BASE_URL}${path}`);
  }

  return res;
}

async function apiRequest<R, D = null>(
  session: NDLSSession,
  path: string,
  data?: D
): Promise<R> {
  const res = await request(`${NDLS_API_PATH}${path}`, {
    headers: {
      Cookie: `${NDLS_COOKIE_SESSION_NAME}=${session}`,
    },
    method: data ? "POST" : "GET",
    body: data ? JSON.stringify(data) : null,
  });

  return (await res.json()) as R;
}
