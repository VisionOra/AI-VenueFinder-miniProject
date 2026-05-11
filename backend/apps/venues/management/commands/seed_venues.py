from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.venues.models import Venue

VENUES = [
    {
        "name": "The Ned Coworking Suite",
        "city": "London",
        "capacity": 80,
        "price_per_day": "3200.00",
        "description": "A refined event space within the iconic Ned hotel in the heart of the City of London. Floor-to-ceiling windows, natural daylight, and integrated AV make it ideal for product launches and leadership offsites.",
        "amenities": ["wifi", "av", "catering", "natural_light", "reception_desk"],
    },
    {
        "name": "Frameless Immersive Venue",
        "city": "London",
        "capacity": 200,
        "price_per_day": "6500.00",
        "description": "A cutting-edge immersive venue near Marble Arch offering 360-degree projection walls and modular layout. Perfect for large-scale brand activations, conferences, and experiential launches.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "parking"],
    },
    {
        "name": "Shoreditch Works East",
        "city": "London",
        "capacity": 50,
        "price_per_day": "1800.00",
        "description": "Industrial-chic warehouse space in the heart of Shoreditch. Exposed brick, flexible layout, fast fibre broadband, and a rooftop terrace. A favourite for tech startups and creative agencies.",
        "amenities": ["wifi", "av", "rooftop_terrace", "bike_storage", "natural_light"],
    },
    {
        "name": "Kings Place Conference Centre",
        "city": "London",
        "capacity": 420,
        "price_per_day": "9800.00",
        "description": "A purpose-built conference centre on the Regent's Canal offering two concert halls, breakout suites, and exceptional catering. Ideal for annual summits and large corporate conferences.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "accessibility", "parking"],
    },
    {
        "name": "Battersea Power Station Turbine Hall",
        "city": "London",
        "capacity": 600,
        "price_per_day": "18000.00",
        "description": "One of London's most iconic spaces — the Grade II* listed Turbine Hall at Battersea Power Station. Enormous, dramatic, and fully customisable for the most ambitious corporate events.",
        "amenities": ["wifi", "av", "catering", "parking", "accessibility"],
    },
    {
        "name": "Manchester Science Park Loft",
        "city": "Manchester",
        "capacity": 60,
        "price_per_day": "1400.00",
        "description": "A bright, modern loft event space within Manchester Science Park. Surrounded by the city's tech community, it's a natural fit for innovation workshops and investor meetups.",
        "amenities": ["wifi", "av", "catering", "natural_light", "bike_storage"],
    },
    {
        "name": "HOME Manchester",
        "city": "Manchester",
        "capacity": 150,
        "price_per_day": "3500.00",
        "description": "HOME's flexible event spaces in the heart of Manchester's First Street district. Combines a contemporary arts centre aesthetic with full AV production capabilities.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "accessibility"],
    },
    {
        "name": "Victoria Warehouse",
        "city": "Manchester",
        "capacity": 500,
        "price_per_day": "8500.00",
        "description": "A converted Victorian cotton warehouse near Salford Quays. Raw industrial character, massive open floor, and production-ready rigging make it perfect for large conferences and gala dinners.",
        "amenities": ["wifi", "av", "catering", "parking", "green_room"],
    },
    {
        "name": "The Biscuit Factory",
        "city": "Edinburgh",
        "capacity": 120,
        "price_per_day": "2800.00",
        "description": "Housed in a converted Leith warehouse, this gallery and event space exudes character. Exposed stone, large skylights, and a courtyard garden create a memorable backdrop for leadership retreats.",
        "amenities": ["wifi", "av", "catering", "natural_light", "courtyard"],
    },
    {
        "name": "Edinburgh International Conference Centre (EICC)",
        "city": "Edinburgh",
        "capacity": 1200,
        "price_per_day": "22000.00",
        "description": "Scotland's premier conference venue, purpose-built for international congresses, trade shows, and AGMs. Modular halls, broadcast studio, and 5G connectivity throughout.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "parking", "accessibility", "broadcast_studio"],
    },
    {
        "name": "Radisson Collection Royal Mile",
        "city": "Edinburgh",
        "capacity": 80,
        "price_per_day": "2400.00",
        "description": "Elegant meeting and event suites within the Radisson Collection on the Royal Mile. Castle views, bespoke catering, and a dedicated events team make this effortlessly professional.",
        "amenities": ["wifi", "av", "catering", "natural_light", "accessibility"],
    },
    {
        "name": "The Studio Birmingham",
        "city": "Birmingham",
        "capacity": 200,
        "price_per_day": "4200.00",
        "description": "A flexible event campus in central Birmingham comprising five interconnected event spaces. Fully self-contained with an in-house culinary team and state-of-the-art AV infrastructure.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "parking", "accessibility"],
    },
    {
        "name": "Custard Factory Event Space",
        "city": "Birmingham",
        "capacity": 300,
        "price_per_day": "5500.00",
        "description": "The iconic Custard Factory creative quarter in Digbeth. Raw industrial heritage meets a thriving creative ecosystem. Perfect for company away days and brand experiences.",
        "amenities": ["wifi", "av", "outdoor_space", "breakout_rooms", "bike_storage"],
    },
    {
        "name": "Tobacco Factory Bristol",
        "city": "Bristol",
        "capacity": 250,
        "price_per_day": "4800.00",
        "description": "A stunning converted tobacco factory in Southville, Bristol. Vast timber floors, brick arches, and generous natural light provide a characterful setting for conferences and product launches.",
        "amenities": ["wifi", "av", "catering", "natural_light", "breakout_rooms"],
    },
    {
        "name": "Engine Shed Bristol",
        "city": "Bristol",
        "capacity": 350,
        "price_per_day": "6200.00",
        "description": "Bristol's leading enterprise and innovation hub in Brunel's original engine shed. Next to Temple Meads station with excellent transport links and full event production facilities.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "parking", "accessibility"],
    },
    {
        "name": "Epoch Loft Leeds",
        "city": "Leeds",
        "capacity": 70,
        "price_per_day": "1600.00",
        "description": "A chic loft event space in Leeds' South Bank regeneration zone. Polished concrete floors, exposed steel, and panoramic city views. Great for smaller leadership gatherings and team days.",
        "amenities": ["wifi", "av", "catering", "natural_light", "rooftop_terrace"],
    },
    {
        "name": "Royal Armouries Conference Suite",
        "city": "Leeds",
        "capacity": 450,
        "price_per_day": "9000.00",
        "description": "World-class conference facilities within the Royal Armouries Museum on the Leeds waterfront. Unique cultural backdrop, professional AV, and flexible room configurations for large-scale events.",
        "amenities": ["wifi", "av", "catering", "parking", "accessibility", "breakout_rooms"],
    },
    {
        "name": "The Lighthouse Glasgow",
        "city": "Glasgow",
        "capacity": 130,
        "price_per_day": "3100.00",
        "description": "Scotland's Centre for Design and Architecture in a Charles Rennie Mackintosh landmark building. Multiple gallery and event floors with rooftop views across Glasgow's skyline.",
        "amenities": ["wifi", "av", "catering", "natural_light", "rooftop_terrace", "accessibility"],
    },
    {
        "name": "SWG3 Glasgow",
        "city": "Glasgow",
        "capacity": 700,
        "price_per_day": "12000.00",
        "description": "Glasgow's most dynamic multi-space arts and events campus in Finnieston. Six unique spaces from intimate board rooms to a 700-capacity warehouse. Full production infrastructure in-house.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "parking", "green_room"],
    },
    {
        "name": "Platform Leeds",
        "city": "Leeds",
        "capacity": 100,
        "price_per_day": "2200.00",
        "description": "A creative venue and co-working hub under Leeds City Station's Victorian arches. Unique curved brick architecture, flexible layout, and fast broadband connectivity throughout.",
        "amenities": ["wifi", "av", "catering", "natural_light", "breakout_rooms"],
    },
    {
        "name": "The Coffin Works Birmingham",
        "city": "Birmingham",
        "capacity": 40,
        "price_per_day": "900.00",
        "description": "An extraordinary Victorian workshop museum in the Jewellery Quarter available for intimate events. Unique heritage setting with a fully equipped boardroom for up to 40 guests.",
        "amenities": ["wifi", "av", "catering", "natural_light"],
    },
    {
        "name": "Central Hall Manchester",
        "city": "Manchester",
        "capacity": 900,
        "price_per_day": "15000.00",
        "description": "Grade II* listed Methodist Central Hall in the heart of Manchester. Magnificent main auditorium with original Victorian organ, modern AV overlay, and grand reception spaces.",
        "amenities": ["wifi", "av", "catering", "breakout_rooms", "parking", "accessibility"],
    },
    {
        "name": "Dundas Castle Edinburgh",
        "city": "Edinburgh",
        "capacity": 35,
        "price_per_day": "7500.00",
        "description": "An exclusive-use 15th-century Scottish castle just outside Edinburgh. The ultimate executive retreat — private grounds, a dedicated chef, and complete privacy for senior leadership offsites.",
        "amenities": ["catering", "parking", "outdoor_space", "accommodation", "natural_light"],
    },
    {
        "name": "Paintworks Events Space",
        "city": "Bristol",
        "capacity": 180,
        "price_per_day": "3400.00",
        "description": "Located in Bristol's Paintworks creative quarter on the River Avon. Exposed concrete, a landscaped courtyard, and a full production kitchen make it a versatile and popular choice.",
        "amenities": ["wifi", "av", "catering", "courtyard", "breakout_rooms", "bike_storage"],
    },
    {
        "name": "Oran Mor Glasgow",
        "city": "Glasgow",
        "capacity": 250,
        "price_per_day": "4600.00",
        "description": "A stunning converted church in Glasgow's West End with the famous Alasdair Gray ceiling mural. Brasserie, multiple event spaces, and a warm Scottish atmosphere for memorable corporate dining events.",
        "amenities": ["wifi", "av", "catering", "natural_light", "accessibility"],
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample venue data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing venues before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Venue.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing venues."))

        created_count = 0
        for data in VENUES:
            _, created = Venue.objects.get_or_create(name=data["name"], city=data["city"], defaults=data)
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} new venues ({len(VENUES)} total processed)."))

        # Also create a demo user for testing if it doesn't exist
        User = get_user_model()
        if not User.objects.filter(username="demo").exists():
            User.objects.create_user(username="demo", email="demo@venuefinder.com", password="demo1234")
            self.stdout.write(self.style.SUCCESS("Created demo user: demo / demo1234"))
