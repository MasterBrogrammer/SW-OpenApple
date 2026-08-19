import { i as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { r as getSql } from "./db-Pi5IMkN1.mjs";
import { t as authMiddleware } from "./middleware-I1-vhrOI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorites-BfY4Iraf.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listFavorites_createServerFn_handler = createServerRpc({
	id: "2f410b3fb618f7a868b1b54b341202e7f25b2fddb025f03288c8d53e12dc6635",
	name: "listFavorites",
	filename: "src/lib/server/favorites.ts"
}, (opts) => listFavorites.__executeServer(opts));
var listFavorites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFavorites_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select software_id from favorites
      where user_id = ${context.userId}
      order by created_at desc
    `).map((row) => row.software_id);
});
var toggleFavorite_createServerFn_handler = createServerRpc({
	id: "8903222aa7247b0ad28c3580682328be3d77c9766690779a9a7358df6b5e49f9",
	name: "toggleFavorite",
	filename: "src/lib/server/favorites.ts"
}, (opts) => toggleFavorite.__executeServer(opts));
var toggleFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((softwareId) => softwareId.trim()).handler(toggleFavorite_createServerFn_handler, async ({ context, data: softwareId }) => {
	if (!softwareId) return { starred: false };
	const sql = await getSql();
	if ((await sql`
      select software_id from favorites
      where user_id = ${context.userId} and software_id = ${softwareId}
    `).length) {
		await sql`
        delete from favorites
        where user_id = ${context.userId} and software_id = ${softwareId}
      `;
		return { starred: false };
	}
	await sql`
      insert into favorites (user_id, software_id)
      values (${context.userId}, ${softwareId})
    `;
	return { starred: true };
});
//#endregion
export { listFavorites_createServerFn_handler, toggleFavorite_createServerFn_handler };
