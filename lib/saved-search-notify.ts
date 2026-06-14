import { prisma } from "@/lib/prisma";
import { sendSavedSearchAlertEmail } from "@/lib/email";
import { describeSavedSearch, filtersToSearchParams, type SavedSearchFilters } from "@/lib/saved-search";
import { listingMatchesFilters } from "@/lib/saved-search-match";
import { absoluteUrl } from "@/lib/site";

export async function notifySavedSearchesForListing(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { category: { select: { slug: true } } },
  });

  if (!listing || listing.status !== "ACTIVE") return;

  const searches = await prisma.savedSearch.findMany({
    include: {
      user: { select: { id: true, email: true, isVerified: true } },
    },
  });

  for (const search of searches) {
    if (search.userId === listing.userId) continue;
    if (!search.user.isVerified) continue;

    const filters = (search.filters || {}) as SavedSearchFilters;
    if (!(await listingMatchesFilters(listing, filters))) continue;

    const alreadySent = await prisma.savedSearchAlert.findUnique({
      where: {
        savedSearchId_listingId: {
          savedSearchId: search.id,
          listingId: listing.id,
        },
      },
    });
    if (alreadySent) continue;

    const searchLabel = search.name || describeSavedSearch(filters);
    const listingUrl = absoluteUrl(`/ilan/${listing.id}`);
    const searchUrl = absoluteUrl(`/ilanlar?${filtersToSearchParams(filters)}`);
    const formattedPrice = new Intl.NumberFormat("tr-TR").format(listing.price);

    const mail = await sendSavedSearchAlertEmail(search.user.email, {
      searchLabel,
      listingTitle: listing.title,
      listingPrice: formattedPrice,
      listingCity: listing.city,
      listingUrl,
      searchUrl,
    });

    if (!mail.ok) continue;

    await prisma.savedSearchAlert.create({
      data: {
        savedSearchId: search.id,
        listingId: listing.id,
      },
    });
  }
}
