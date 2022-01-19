import { setTimeout } from "timers/promises";
import fuzzysearch from "fuzzysearch";
import config from "config";
import { program } from "commander";
import {
  getSlotsForCenter,
  createAuthenticatedNDLSSession,
  NDLSCentreSlot,
  NDLSCentre,
  NDLSSession,
  getCenters,
} from "../booking";
import { groupBy, map } from "lodash";
import { format, isEqual } from "date-fns";
import beeper from "beeper";
import { notify } from "node-notifier";

async function slots(centreName: string) {
  const session = await createAuthenticatedNDLSSession(
    config.get("ndls.details")
  );
  const centre = await matchCentre(session, centreName);

  let previousSlots = null;

  while (true) {
    console.log(`>>> Checking slots for centre: ${formatCentre(centre)}`);

    const slots = await getSlotsForCenter(session, centre.id);

    if (previousSlots) {
      const newSlots = slots.filter(
        (slot) => !includesSlot(previousSlots, slot)
      );

      console.log(`>>> ${newSlots.length} new slots found`);

      if (newSlots.length) {
        notify(`${newSlots.length} new slots found`);
        printSlots(newSlots);

        await beeper(3);
      }
    } else {
      printSlots(slots);
    }

    previousSlots = slots;

    await setTimeout(10000);
  }
}

async function matchCentre(
  session: NDLSSession,
  search: string
): Promise<NDLSCentre> {
  const centres = await getCenters(session);
  const matchingCentres = centres.filter((centre) =>
    isCentreFuzzyMatch(search, centre)
  );

  if (matchingCentres.length > 1) {
    throw new Error(
      `More than one centre found for '${search}', please be more specific (matched: ${matchingCentres
        .map(formatCentre)
        .join("; ")})`
    );
  } else if (matchingCentres.length === 0) {
    throw new Error(`No matching centres found for '${search}'`);
  }

  return matchingCentres[0];
}

function isCentreFuzzyMatch(search: string, centre: NDLSCentre): boolean {
  return fuzzysearch(search.toLowerCase(), formatCentre(centre).toLowerCase());
}

function formatCentre(centre: NDLSCentre): string {
  return `${centre.location}, ${centre.county}`;
}

function includesSlot(slots: NDLSCentreSlot[], slot: NDLSCentreSlot): boolean {
  return slots.some((existingSlot) => isSlotEqual(existingSlot, slot));
}

function isSlotEqual(a: NDLSCentreSlot, b: NDLSCentreSlot): boolean {
  return isEqual(a.start, b.start) && isEqual(b.end, b.end);
}

function printSlots(slots: NDLSCentreSlot[]) {
  getSlotDayCount(slots).forEach(([date, count]) =>
    console.log(`> ${date}: ${count} slots`)
  );
}

function getSlotDayCount(slots: NDLSCentreSlot[]): [string, number][] {
  return map(
    groupBy(slots, (interval) => format(interval.start, "MM-dd-yyyy")),
    (intervals, date) => [date, intervals.length]
  );
}

if (require.main === module) {
  program.command("slots").argument("<centre name>").action(slots);

  program.parseAsync(process.argv).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
