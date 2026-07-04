import { startup } from "./startup";

registerPlugin({
	name: "openrct2-guest-weight-manager",
	version: "0.0.1",
	authors: [ "Iris Hitomi Nakayama" ],
	type: "local",
	licence: "MIT",
	/**
	 * This field determines which OpenRCT2 API version to use. It's best to always use the
	 * latest release version, unless you want to use specific versions from a newer develop
	 * version. Version 111 equals the v0.5.0 release.
	 * @see https://github.com/OpenRCT2/OpenRCT2/blob/v0.5.0/src/openrct2/scripting/ScriptEngine.h#L45
	 */
	targetApiVersion: 115,
	main: startup,
});
