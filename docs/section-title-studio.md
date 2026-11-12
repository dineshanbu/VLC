# Section Title Studio

## Source of truth

Public section labels and headings are managed in **Admin → Section Title Studio**. The Studio stores English and Saudi Arabic values independently. Saving an empty value intentionally removes that label or heading from the public page; public templates must not substitute a hidden fallback when a saved value is empty.

## Home page order

1. Hero banner · main heading
2. Our Platform · label
3. Our Platform · heading
4. About VIC · label and heading lines
5. Remaining sections in the order they appear on the landing page

## Coverage rule

Each public section label or heading uses a stable key in `SECTION_HEADING_DEFAULTS` and the `sectionHeading` pipe. Page-specific editors may continue to manage descriptions, imagery, media, buttons, and dynamic records, but must not be a competing source for section labels or headings. Dynamic content titles such as product names, news headlines, leader names, and job titles remain data records rather than section headings.

## Initialization

On first opening the Studio, catalog defaults are saved to the section-heading store only for keys that do not already exist. Existing saved values, including intentionally empty values, are preserved.
