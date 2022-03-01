export class Property {
    constructor(public id: number,
                public title: string, 
                public description: string,
                public type: string,
                public status: string[], 
                public details: ProjectDetails,
                public formatted_address: string,
                public features: string[],
                public featured: boolean,
                public sold: any,

                public additional_features: AdditionalFeature[],
                public gallery: Gallery[],
                public plans: Plan[],
                public videos: Video[],
                public updated_at: string,
                public agent: Agent){ }
}

// export class Property {
//     public id: number;
//     public title: string; 
//     public desc: string;
//     public propertyType: string;
//     public propertyStatus: string[];
//     public city: string;
//     public zipCode: string;
//     public neighborhood: string[];
//     public street: string[];
//     public location: Location;
//     public formattedAddress: string;
//     public features: string[];
//     public featured: boolean;
//     public priceDollar: Price;
//     public priceEuro: Price;
//     public bedrooms: number;
//     public bathrooms: number;
//     public garages: number;
//     public area: Area;
//     public yearBuilt: number;
//     public ratingsCount: number;
//     public ratingsValue: number;
//     public additionalFeatures: AdditionalFeature[];
//     public gallery: Gallery[];
//     public plans: Plan[];
//     public videos: Video[];
//     public published: string;
//     public lastUpdate: string;
//     public views: number
// }


export class PropertyType {
    constructor(public id: number, public name: string) {}
}

export class PropertyStatus {
    constructor(public id: number, public name: string) {}
}

export class Area {
    constructor(public id: number, 
                public value: number,
                public unit: string){ }
}

export class ProjectDetails {
    constructor (
        public city: string,
        public zipcode: string[],
        public neighborhood: string[],
        public street: string[],
        public lat: number,
        public lng: number,
        public address: string,
        public price_dollar_sale: number,
        public price_dollar_rent: number,
        public price_euro_sale: number,
        public price_euro_rent: number,
        public bedrooms: number,
        public bathrooms: number,
        public garages: number,
        public area: Area,
        public year: number,
        public ratings_count: number,
        public ratings_value: number,
        public published: string,
        public views: number
    ){}
}

export class AdditionalFeature {
    constructor(public id: number, 
                public name: string,
                public value: string){ }
}

export class Location {
    constructor(public id: number, 
                public lat: number,
                public lng: number){ }
}

export class Price {
    public sale: number;
    public rent: number;
}


export class Gallery {
    constructor(public id: number, 
                public small: string,
                public medium: string,
                public big: string){ }
}

export class Plan {
    constructor(public id: number, 
                public name: string,
                public desc: string,
                public area: Area,
                public rooms: number,
                public baths: number,
                public image: string){ }
}

export class Video {
    constructor(public id: number, 
                public name: string,
                public link: string){ }
}

export class Pagination {
    constructor(public page: number,
                public perPage: number,
                public prePage: number,
                public nextPage: number,
                public total: number,
                public totalPages: number){ }
}

export class Agent {
    constructor(public id: number,
                public email: string,
                public company_id: number,
                public user_type: string,
                public first_name: string,
                public last_name: string,
                public desc: string,
                public organization: string,
                public phone: string,
                public facebook: string,
                public twitter: string,
                public linkedin: string,
                public instagram: string,
                public website: string,
                public ratings_count: number,
                public ratings_value: number,
                public image: string,
                public company: Company,
                public profile: any) { }
}

export class User {
    constructor(public id: number,
        public email: string,
        public first_name: string,
        public last_name: string,
        public password: string,
        public company_id: number,
        public user_type: string,
        public token?: string
        ) {}
}

export class Company {
    constructor(
        public id: number,
        public name: string,
        public address1: string,
        public address2: string,
        public logo: string,
        public city: string,
        public state: string,
        public zip: string,
        public phone1: string,
        public phone2: string,
        public fax: string,
        public email: string,
        public description: string,
        public about_us: string,
    ) {}
}

export class Application {
     constructor(
        public id: number,
        public historypayment: number,
        public status: number,
        public contract: any,
        public property: any,
        public property_id: any
     ){}
}