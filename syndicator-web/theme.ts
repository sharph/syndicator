
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const syndicatorTheme: CustomThemeConfig = {
    name: 'syndicator',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "6px",
		"--theme-rounded-container": "4px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "0 0 0",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #62a0ea 
		"--color-primary-50": "231 241 252", // #e7f1fc
		"--color-primary-100": "224 236 251", // #e0ecfb
		"--color-primary-200": "216 231 250", // #d8e7fa
		"--color-primary-300": "192 217 247", // #c0d9f7
		"--color-primary-400": "145 189 240", // #91bdf0
		"--color-primary-500": "98 160 234", // #62a0ea
		"--color-primary-600": "88 144 211", // #5890d3
		"--color-primary-700": "74 120 176", // #4a78b0
		"--color-primary-800": "59 96 140", // #3b608c
		"--color-primary-900": "48 78 115", // #304e73
		// secondary | #b5835a 
		"--color-secondary-50": "244 236 230", // #f4ece6
		"--color-secondary-100": "240 230 222", // #f0e6de
		"--color-secondary-200": "237 224 214", // #ede0d6
		"--color-secondary-300": "225 205 189", // #e1cdbd
		"--color-secondary-400": "203 168 140", // #cba88c
		"--color-secondary-500": "181 131 90", // #b5835a
		"--color-secondary-600": "163 118 81", // #a37651
		"--color-secondary-700": "136 98 68", // #886244
		"--color-secondary-800": "109 79 54", // #6d4f36
		"--color-secondary-900": "89 64 44", // #59402c
		// tertiary | #f3d074 
		"--color-tertiary-50": "253 248 234", // #fdf8ea
		"--color-tertiary-100": "253 246 227", // #fdf6e3
		"--color-tertiary-200": "252 243 220", // #fcf3dc
		"--color-tertiary-300": "250 236 199", // #faecc7
		"--color-tertiary-400": "247 222 158", // #f7de9e
		"--color-tertiary-500": "243 208 116", // #f3d074
		"--color-tertiary-600": "219 187 104", // #dbbb68
		"--color-tertiary-700": "182 156 87", // #b69c57
		"--color-tertiary-800": "146 125 70", // #927d46
		"--color-tertiary-900": "119 102 57", // #776639
		// success | #76c11c 
		"--color-success-50": "234 246 221", // #eaf6dd
		"--color-success-100": "228 243 210", // #e4f3d2
		"--color-success-200": "221 240 198", // #ddf0c6
		"--color-success-300": "200 230 164", // #c8e6a4
		"--color-success-400": "159 212 96", // #9fd460
		"--color-success-500": "118 193 28", // #76c11c
		"--color-success-600": "106 174 25", // #6aae19
		"--color-success-700": "89 145 21", // #599115
		"--color-success-800": "71 116 17", // #477411
		"--color-success-900": "58 95 14", // #3a5f0e
		// warning | #ff7800 
		"--color-warning-50": "255 235 217", // #ffebd9
		"--color-warning-100": "255 228 204", // #ffe4cc
		"--color-warning-200": "255 221 191", // #ffddbf
		"--color-warning-300": "255 201 153", // #ffc999
		"--color-warning-400": "255 161 77", // #ffa14d
		"--color-warning-500": "255 120 0", // #ff7800
		"--color-warning-600": "230 108 0", // #e66c00
		"--color-warning-700": "191 90 0", // #bf5a00
		"--color-warning-800": "153 72 0", // #994800
		"--color-warning-900": "125 59 0", // #7d3b00
		// error | #e01b24 
		"--color-error-50": "250 221 222", // #faddde
		"--color-error-100": "249 209 211", // #f9d1d3
		"--color-error-200": "247 198 200", // #f7c6c8
		"--color-error-300": "243 164 167", // #f3a4a7
		"--color-error-400": "233 95 102", // #e95f66
		"--color-error-500": "224 27 36", // #e01b24
		"--color-error-600": "202 24 32", // #ca1820
		"--color-error-700": "168 20 27", // #a8141b
		"--color-error-800": "134 16 22", // #861016
		"--color-error-900": "110 13 18", // #6e0d12
		// surface | #3d3846 
		"--color-surface-50": "255 255 255", // #ffffff
		"--color-surface-100": "216 215 218", // #d8d7da
		"--color-surface-200": "207 205 209", // #cfcdd1
		"--color-surface-300": "177 175 181", // #b1afb5
		"--color-surface-400": "119 116 126", // #77747e
		"--color-surface-500": "61 56 70", // #3d3846
		"--color-surface-600": "55 50 63", // #37323f
		"--color-surface-700": "46 42 53", // #2e2a35
		"--color-surface-800": "37 34 42", // #25222a
		"--color-surface-900": "30 27 34", // #1e1b22
		
	}
}