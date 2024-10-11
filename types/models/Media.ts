export interface Media {
    id: number;
    uuid: string;
    name: string;
    type: string;
    disk: string;
    size: number;
    conversions_disk: string;
    mime_type: string;
    extension: string;
    created_at: string;
    order_column: number;
    updated_at: string;
    custom_properties: any[];
    manipulations: any[];
    preview_url: string;
    file_name: string;
    generated_conversions: any;
    collection_name: string;
    original_url: string;
    responsive_images: any[];
    humanReadableSize: string;
    thumb_url: string;
}