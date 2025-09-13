"use strict";(()=>{var e={};e.id=442,e.ids=[442],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2615:e=>{e.exports=require("http")},5240:e=>{e.exports=require("https")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1568:e=>{e.exports=require("zlib")},9546:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>v,requestAsyncStorage:()=>l,routeModule:()=>p,serverHooks:()=>c,staticGenerationAsyncStorage:()=>_});var s={};t.r(s),t.d(s,{GET:()=>d});var o=t(1686),i=t(4975),n=t(8640),a=t(8039),u=t(6974);async function d(e){try{let{data:{user:e},error:r}=await u.OQ.auth.getUser();if(r||!e)return a.NextResponse.json({error:"Unauthorized"},{status:401});let{data:t,error:s}=await u.OQ.from("orders").select(`
        id,
        buyer_id,
        seller_id,
        listing_id,
        vendor_product_id,
        service_booking_id,
        status,
        created_at,
        total_amount_rub,
        listings (
          title,
          photo_urls
        ),
        vendor_products (
          name,
          photo_urls
        ),
        service_bookings (
          services (
            title,
            service_providers (
              name
            )
          )
        ),
        profiles!orders_buyer_id_fkey (
          first_name,
          last_name
        ),
        profiles!orders_seller_id_fkey (
          first_name,
          last_name
        )
      `).or(`buyer_id.eq.${e.id},seller_id.eq.${e.id}`).order("created_at",{ascending:!1});if(s)return console.error("Error fetching orders:",s),a.NextResponse.json({error:"Failed to fetch orders"},{status:500});let o=t?.map(r=>{let t=r.buyer_id===e.id,s=r.profiles,o=s?`${s.first_name||""} ${s.last_name||""}`.trim():"Unknown User",i="",n="";return r.listings?(i=r.listings.title,n=r.listings.photo_urls?.[0]||""):r.vendor_products?(i=r.vendor_products.name,n=r.vendor_products.photo_urls?.[0]||""):r.service_bookings&&(i=r.service_bookings.services.title,n=""),{id:r.id,type:t?"buying":"selling",title:i,price_rub:r.total_amount_rub,status:r.status,created_at:r.created_at,buyer_name:t?void 0:o,seller_name:t?o:void 0,photo_url:n}})||[];return a.NextResponse.json(o)}catch(e){return console.error("Error in orders API:",e),a.NextResponse.json({error:"Internal server error"},{status:500})}}let p=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/user/orders/route",pathname:"/api/user/orders",filename:"route",bundlePath:"app/api/user/orders/route"},resolvedPagePath:"D:\\Users\\enyoc\\Documents\\Dev\\ciuna\\app\\api\\user\\orders\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:l,staticGenerationAsyncStorage:_,serverHooks:c}=p,m="/api/user/orders/route";function v(){return(0,n.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:_})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[843,402,974],()=>t(9546));module.exports=s})();