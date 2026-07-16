import { StickyHeader } from "../ui/v2/StickyHeader";

function NavHeader({ title, subtitle = null, statusBadge, backPath }) {
    return (
        <StickyHeader>
            <StickyHeader.Action to={backPath} />
            <StickyHeader.InfoStack>
                <StickyHeader.Title>{title}</StickyHeader.Title>
                {subtitle && <StickyHeader.Subtitle>{subtitle}</StickyHeader.Subtitle>}
            </StickyHeader.InfoStack>
            <StickyHeader.SideSlot>
                {statusBadge}
            </StickyHeader.SideSlot>
        </StickyHeader>
    );
}


export default NavHeader