const SEARCH_PATH = "/api/yelp/businesses/search";

async function searchBusinesses(term, location, sortBy) {

    const params = new URLSearchParams({
        term,
        location,
        sort_by: sortBy,
        limit: "20",
    });

    //send fetch request to Yelp backend search endpoint
    const res = await fetch(`${SEARCH_PATH}?${params}`);
    // check if response failed and throw error if needed
    if (!res.ok) {
        throw new Error(`Yelp request failed (${res.status})`);
    }

    // convert response to json
    const jsonResponse = await res.json();
    console.log(jsonResponse);

    // return businesses array mapped into the format used by businesses component
    return jsonResponse.businesses.map((business) => ({
        imageSrc: business.image_url,
        name: business.name,

        address: business.location.address1,
        city: business.location.city,
        state: business.location.state,
        zipCode: business.location.zip_code,

        category: business.categories[0]?.title,
        rating: business.rating,
        reviewCount: business.review_count,

        id: business.id,
    }));
}

export default searchBusinesses;