{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {nixpkgs, ...} @ inputs: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {inherit system;};

    name = "ags-shell";

    extraPackages = with inputs.ags.packages.${system}; [
      pkgs.libadwaita
      pkgs.glib-networking
      pkgs.libsoup_3
      astal4
      apps
      battery
      hyprland
      network
      notifd
      tray
      wireplumber
    ];

    ags = inputs.ags.packages.${system}.default.override {inherit extraPackages;};
  in {
    packages.${system} = {
      default = pkgs.stdenv.mkDerivation {
        inherit name;
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook3
          gobject-introspection
          ags
        ];

        buildInputs = extraPackages;

        installPhase = ''
          mkdir -p $out/bin
          ags bundle app.ts $out/bin/${name}
        '';
      };

      inherit ags;
    };

    devShells.${system}.default = pkgs.mkShell {
      shellHook = ''
        ${pkgs.watchexec}/bin/watchexec -e ts,tsx,scss -r "${ags}/bin/ags run ."
        exit
      '';
    };
  };
}
