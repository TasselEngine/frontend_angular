﻿using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Tassel.Service.Utils.Extensionss {

    public struct PolicyRole {
        public const string Core = "CORE";
        public const string Admin = "Admin";
        public const string User = "User";
    }

    public struct TokenClaimsKey {
        public const string RoleID = "role_id";
        public const string Gender = "gender";
        public const string UserName = "u_name";
        public const string Password = "psd";
        public const string UUID = "uuid";
    }

    public struct TokenProviderEntry {
        public const string Issuer = "Tassel_ISS";
        public const string Audience = "Tassel_AUDN";
        public const string TokenName = "smhs_token";
        public const string CookieScheme = "Tassel_Cookie";
        public const string RegisterPath = "/register";
        public const string LoginPath = "/login";
        public const string AccessDenied = "/403";
    }

    public class TokenDecoder {

        public static TokenValidationParameters CreateParam(SecurityKey signingKey) {
            return new TokenValidationParameters {
                ValidateIssuerSigningKey = true,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                IssuerSigningKey = signingKey,
                ValidIssuer = TokenProviderEntry.Issuer,
                ValidAudience = TokenProviderEntry.Audience,
                ClockSkew = TimeSpan.Zero
            };
        }

        public static SecurityKey CreateKey(IConfigurationRoot root) {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(root.GetSection("AccessKey")["Key"]));
        }

        public static SecurityKey CreateKey(IConfiguration root) {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(root.GetSection("AccessKey")["Key"]));
        }

        public TokenDecoder(TokenValidationParameters param, string algorithm = SecurityAlgorithms.HmacSha256) {
            this.algorithm = algorithm;
            this.param = param;
        }

        public TokenDecoder(SecurityKey signingKey, string algorithm = SecurityAlgorithms.HmacSha256) {
            this.algorithm = algorithm;
            this.param = CreateParam(signingKey);
        }

        public TokenDecoder(IHostingEnvironment env) {
            this.algorithm = SecurityAlgorithms.HmacSha256;
            this.param = CreateParam(
                CreateKey(new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build()));
        }

        private readonly string algorithm;
        private readonly TokenValidationParameters param;

        public AuthenticationTicket Unprotect(string cookie) {
            var handler = new JwtSecurityTokenHandler();
            var principal = default(ClaimsPrincipal);
            try {
                principal = handler.ValidateToken(cookie, this.param, out SecurityToken validToken);
                var validJwt = validToken as JwtSecurityToken;
                if (validJwt == null)
                    throw new ArgumentException("Invalid JWT");
                if (!validJwt.Header.Alg.Equals(algorithm, StringComparison.Ordinal))
                    throw new ArgumentException($"Algorithm must be '{algorithm}'");

                // TO DO : add more logic if need.

            } catch (SecurityTokenValidationException) {
                return null;
            } catch (ArgumentException) {
                return null;
            }
            return new AuthenticationTicket(principal, new AuthenticationProperties(), TokenProviderEntry.CookieScheme);
        }

        public (JwtSecurityToken, string) Decrypt(string cookie) {
            var handler = new JwtSecurityTokenHandler();
            var validJwt = default(JwtSecurityToken);
            try {
                _ = handler.ValidateToken(cookie, this.param, out SecurityToken validToken);
                validJwt = validToken as JwtSecurityToken;
                if (validJwt == null)
                    throw new ArgumentException("Invalid JWT");
                if (!validJwt.Header.Alg.Equals(algorithm, StringComparison.Ordinal))
                    throw new ArgumentException($"Algorithm must be '{algorithm}'");
            } catch (SecurityTokenValidationException e) {
                return (null, e.Message);
            } catch (ArgumentException e) {
                return (null, e.Message);
            }
            return (validJwt, null);
        }
    }

}
